import ProductModel from '../models/productModel.js';
import JobModel from '../models/jobModel.js';
import { pool } from '../middleware/dbConnection.js';
import { getPresignedUrl } from '../config/s3.js';
import logger from '../utils/logger.js';

const ProductController = {
    // 상품 등록
    async createProduct(req, res) {
        logger.info('[Product] 상품 등록 요청 시작', { memberId: req.user?.memberId });
        const connection = await pool.getConnection();
        try {
            const memberId = req.user?.memberId;
            if (!memberId) {
                logger.warn('[Product] 상품 등록 실패 - 인증되지 않은 사용자');
                return res.status(401).json({
                    success: false,
                    message: '인증이 필요합니다.',
                });
            }

            const { name, price, description, images } = req.body;
            logger.info('[Product] 상품 정보', { name, price, imageCount: images?.length || 0 });

            if (!name || !price) {
                logger.warn('[Product] 상품 등록 실패 - 필수 항목 누락');
                return res.status(400).json({
                    success: false,
                    message: '상품명과 가격은 필수 항목입니다.',
                });
            }

            // 이미지 URL 확인
            if (!images || !Array.isArray(images) || images.length === 0) {
                logger.warn('[Product] 상품 등록 실패 - 이미지 URL 누락');
                return res.status(400).json({
                    success: false,
                    message: '최소 1개의 이미지가 필요합니다.',
                });
            }

            await connection.beginTransaction();
            logger.debug('[Product] 트랜잭션 시작');

            // 1. 상품 생성
            const productId = await ProductModel.createProductWithConnection(connection, {
                memberId,
                name,
                price,
                description,
            });
            logger.info('[Product] 상품 생성 완료', { productId });

            // 2. 이미지 URL DB 저장
            await ProductModel.addProductImagesWithConnection(connection, productId, images);

            // 3. AI 상품 설명 자동 생성 큐 등록
            await JobModel.createDescriptionJobWithConnection(connection, productId, name, images);

            // 4. 3DGS 작업 큐 등록
            await JobModel.create3DGSJobWithConnection(connection, productId, images);

            // 트랜잭션 커밋 (모든 작업 완료)
            await connection.commit();
            logger.info('[Product] 상품 등록 성공', { productId });

            // 응답이 아직 전송되지 않았을 때만 응답 전송
            if (!res.headersSent) {
                res.status(201).json({
                    success: true,
                    message: '상품이 등록되었습니다.',
                    data: {
                        productId,
                        images,
                    },
                });
            }
        } catch (error) {
            // 트랜잭션이 시작되었으면 롤백
            try {
                await connection.rollback();
            } catch (rollbackError) {
                logger.error('[Product] 롤백 에러', rollbackError);
            }
            logger.error('[Product] 상품 등록 에러', error);

            // 응답이 아직 전송되지 않았을 때만 응답 전송
            if (!res.headersSent) {
                res.status(500).json({
                    success: false,
                    message: '상품 등록 처리 중 오류가 발생했습니다.',
                });
            }
        } finally {
            connection.release();
        }
    },

    // 상품 목록 조회
    async getProductList(req, res) {
        const { page = 1, limit = 20, status = 'ACTIVE', search = '' } = req.query;
        logger.info('[Product] 상품 목록 조회 요청 시작', { page, limit, status, search });
        try {
            const result = await ProductModel.getProductList({
                page: parseInt(page),
                limit: parseInt(limit),
                status,
                search,
            });

            // seller_img를 presigned URL로 변환
            if (result.products && result.products.length > 0) {
                const productsWithPresignedUrls = await Promise.all(
                    result.products.map(async (product) => {
                        if (product.seller_img) {
                            try {
                                product.seller_img_url = await getPresignedUrl(product.seller_img);
                            } catch (error) {
                                logger.error('[Product] Seller 이미지 Presigned URL 생성 실패', error, { s3_key: product.seller_img });
                                product.seller_img_url = null;
                            }
                        }
                        return product;
                    })
                );
                result.products = productsWithPresignedUrls;
            }

            logger.info('[Product] 상품 목록 조회 성공', { resultCount: result.products?.length || 0 });
            res.status(200).json({
                success: true,
                message: '상품 목록 조회에 성공했습니다.',
                data: result,
            });
        } catch (error) {
            logger.error('[Product] 상품 목록 조회 에러', error);
            res.status(500).json({
                success: false,
                message: '상품 목록 조회 중 오류가 발생했습니다.',
            });
        }
    },

    // 상품 상세 조회
    async getProductById(req, res) {
        const { productId } = req.params;
        logger.info('[Product] 상품 상세 조회 요청 시작', { productId });
        try {
            if (!productId) {
                logger.warn('[Product] 상품 조회 실패 - productId 누락');
                return res.status(400).json({
                    success: false,
                    message: '상품 ID가 필요합니다.',
                });
            }

            const product = await ProductModel.getProductById(productId);

            if (!product) {
                logger.warn('[Product] 상품 조회 실패 - 상품 없음', { productId });
                return res.status(404).json({
                    success: false,
                    message: '상품을 찾을 수 없습니다.',
                });
            }

            logger.info('[Product] 상품 조회 성공', { productId, name: product.name });

            // seller_img를 presigned URL로 변환
            if (product.seller_img) {
                try {
                    product.seller_img_url = await getPresignedUrl(product.seller_img);
                } catch (error) {
                    logger.error('[Product] Seller 이미지 Presigned URL 생성 실패', error, { s3_key: product.seller_img });
                    product.seller_img_url = null;
                }
            }

            // s3_key를 presigned URL로 변환
            if (product.images && product.images.length > 0) {
                const imageUrlPromises = product.images.map(async (image) => {
                    if (image.s3_key) {
                        try {
                            const presignedUrl = await getPresignedUrl(image.s3_key);
                            return {
                                ...image,
                                url: presignedUrl,
                            };
                        } catch (error) {
                            logger.error('[Product] Presigned URL 생성 실패', error, { s3_key: image.s3_key });
                            return {
                                ...image,
                                url: null,
                            };
                        }
                    }
                    return image;
                });

                product.images = await Promise.all(imageUrlPromises);
            }

            // 조회수 증가 (비동기로 처리하고 응답에는 영향 안주기)
            ProductModel.increaseViewCount(productId).catch((err) =>
                logger.error('[Product] 조회수 증가 실패', err)
            );

            // 좋아요 여부 확인 (인증된 사용자만)
            let isLiked = false;
            const memberId = req.user?.memberId;
            if (memberId) {
                try {
                    isLiked = await ProductModel.isLiked(productId, memberId);
                } catch (error) {
                    logger.error('[Product] 좋아요 여부 확인 실패', error, { productId, memberId });
                    isLiked = false;
                }
            }

            res.status(200).json({
                success: true,
                message: '상품 조회에 성공했습니다.',
                data: {
                    product,
                    isLiked,
                },
            });
        } catch (error) {
            logger.error('[Product] 상품 조회 에러', error);
            res.status(500).json({
                success: false,
                message: '상품 조회 중 오류가 발생했습니다.',
            });
        }
    },

    // 상품 수정
    async updateProduct(req, res) {
        const { productId } = req.params;
        logger.info('[Product] 상품 수정 요청 시작 - productId:', productId, 'memberId:', req.user?.memberId);
        try {
            const memberId = req.user?.memberId;
            if (!memberId) {
                logger.info('[Product] 상품 수정 실패 - 인증되지 않은 사용자');
                return res.status(401).json({
                    success: false,
                    message: '인증이 필요합니다.',
                });
            }

            const updates = req.body;

            if (!productId) {
                logger.info('[Product] 상품 수정 실패 - productId 누락');
                return res.status(400).json({
                    success: false,
                    message: '상품 ID가 필요합니다.',
                });
            }

            // 소유자 확인
            const isOwner = await ProductModel.isProductOwner(productId, memberId);
            if (!isOwner) {
                logger.info('[Product] 상품 수정 실패 - 권한 없음, productId:', productId, 'memberId:', memberId);
                return res.status(403).json({
                    success: false,
                    message: '상품을 수정할 권한이 없습니다.',
                });
            }

            const updated = await ProductModel.updateProduct(productId, updates);

            if (!updated) {
                logger.info('[Product] 상품 수정 실패 - 상품 없음 또는 변경사항 없음, productId:', productId);
                return res.status(404).json({
                    success: false,
                    message: '상품을 찾을 수 없습니다.',
                });
            }

            logger.info('[Product] 상품 수정 성공 - productId:', productId);
            res.status(200).json({
                success: true,
                message: '상품이 수정되었습니다.',
            });
        } catch (error) {
            logger.error('[Product] 상품 수정 에러:', error);
            res.status(500).json({
                success: false,
                message: '상품 수정 중 오류가 발생했습니다.',
            });
        }
    },

    // 상품 삭제
    async deleteProduct(req, res) {
        const { productId } = req.params;
        logger.info('[Product] 상품 삭제 요청 시작 - productId:', productId, 'memberId:', req.user?.memberId);
        try {
            const memberId = req.user?.memberId;
            if (!memberId) {
                logger.info('[Product] 상품 삭제 실패 - 인증되지 않은 사용자');
                return res.status(401).json({
                    success: false,
                    message: '인증이 필요합니다.',
                });
            }

            if (!productId) {
                logger.info('[Product] 상품 삭제 실패 - productId 누락');
                return res.status(400).json({
                    success: false,
                    message: '상품 ID가 필요합니다.',
                });
            }

            const deleted = await ProductModel.deleteProduct(productId, memberId);

            if (!deleted) {
                logger.info('[Product] 상품 삭제 실패 - 상품 없음/판매완료/권한없음, productId:', productId);
                return res.status(404).json({
                    success: false,
                    message: '상품을 찾을 수 없거나 삭제할 수 없습니다.',
                });
            }

            logger.info('[Product] 상품 삭제 성공 - productId:', productId);
            res.status(200).json({
                success: true,
                message: '상품이 삭제되었습니다.',
            });
        } catch (error) {
            logger.error('[Product] 상품 삭제 에러:', error);
            res.status(500).json({
                success: false,
                message: '상품 삭제 중 오류가 발생했습니다.',
            });
        }
    },

    // 내 판매 내역 조회
    async getMyProducts(req, res) {
        logger.info('[Product] 내 상품 목록 조회 요청 시작 - memberId:', req.user?.memberId);
        try {
            const memberId = req.user?.memberId;
            if (!memberId) {
                logger.info('[Product] 내 상품 목록 조회 실패 - 인증되지 않은 사용자');
                return res.status(401).json({
                    success: false,
                    message: '인증이 필요합니다.',
                });
            }

            const { status } = req.query;

            const products = await ProductModel.getMyProducts(memberId, status);

            logger.info('[Product] 내 상품 목록 조회 성공 - 결과 개수:', products?.length || 0);
            res.status(200).json({
                success: true,
                message: '내 상품 목록 조회에 성공했습니다.',
                data: {
                    products,
                },
            });
        } catch (error) {
            logger.error('[Product] 내 상품 목록 조회 에러:', error);
            res.status(500).json({
                success: false,
                message: '내 상품 목록 조회 중 오류가 발생했습니다.',
            });
        }
    },

    // 상품 좋아요 추가
    async likeProduct(req, res) {
        const { productId } = req.params;
        logger.info('[Product] 좋아요 추가 요청 시작 - productId:', productId, 'memberId:', req.user?.memberId);
        try {
            const memberId = req.user?.memberId;
            if (!memberId) {
                logger.info('[Product] 좋아요 추가 실패 - 인증되지 않은 사용자');
                return res.status(401).json({
                    success: false,
                    message: '인증이 필요합니다.',
                });
            }

            if (!productId) {
                logger.info('[Product] 좋아요 추가 실패 - productId 누락');
                return res.status(400).json({
                    success: false,
                    message: '상품 ID가 필요합니다.',
                });
            }

            // 상품 존재 확인
            const product = await ProductModel.getProductById(productId);
            if (!product) {
                logger.info('[Product] 좋아요 추가 실패 - 상품 없음, productId:', productId);
                return res.status(404).json({
                    success: false,
                    message: '상품을 찾을 수 없습니다.',
                });
            }

            // 좋아요 추가 (중복 체크 포함)
            const result = await ProductModel.addLike(productId, memberId);

            if (!result.success) {
                if (result.reason === 'already_liked') {
                    logger.info('[Product] 좋아요 추가 실패 - 이미 좋아요함, productId:', productId);
                    return res.status(400).json({
                        success: false,
                        message: '이미 좋아요한 상품입니다.',
                    });
                }
                logger.info('[Product] 좋아요 추가 실패 - reason:', result.reason);
                return res.status(400).json({
                    success: false,
                    message: '좋아요 추가에 실패했습니다.',
                });
            }

            logger.info('[Product] 좋아요 추가 성공 - productId:', productId);
            res.status(200).json({
                success: true,
                message: '좋아요가 추가되었습니다.',
            });
        } catch (error) {
            logger.error('[Product] 좋아요 추가 에러:', error);
            res.status(500).json({
                success: false,
                message: '좋아요 추가 중 오류가 발생했습니다.',
            });
        }
    },

    // 상품 좋아요 취소
    async unlikeProduct(req, res) {
        const { productId } = req.params;
        logger.info('[Product] 좋아요 취소 요청 시작 - productId:', productId, 'memberId:', req.user?.memberId);
        try {
            const memberId = req.user?.memberId;
            if (!memberId) {
                logger.info('[Product] 좋아요 취소 실패 - 인증되지 않은 사용자');
                return res.status(401).json({
                    success: false,
                    message: '인증이 필요합니다.',
                });
            }

            if (!productId) {
                logger.info('[Product] 좋아요 취소 실패 - productId 누락');
                return res.status(400).json({
                    success: false,
                    message: '상품 ID가 필요합니다.',
                });
            }

            // 상품 존재 확인
            const product = await ProductModel.getProductById(productId);
            if (!product) {
                logger.info('[Product] 좋아요 취소 실패 - 상품 없음, productId:', productId);
                return res.status(404).json({
                    success: false,
                    message: '상품을 찾을 수 없습니다.',
                });
            }

            // 좋아요 취소
            const result = await ProductModel.removeLike(productId, memberId);

            if (!result.success) {
                if (result.reason === 'not_liked') {
                    logger.info('[Product] 좋아요 취소 실패 - 좋아요 안했음, productId:', productId);
                    return res.status(400).json({
                        success: false,
                        message: '좋아요하지 않은 상품입니다.',
                    });
                }
                logger.info('[Product] 좋아요 취소 실패 - reason:', result.reason);
                return res.status(400).json({
                    success: false,
                    message: '좋아요 취소에 실패했습니다.',
                });
            }

            logger.info('[Product] 좋아요 취소 성공 - productId:', productId);
            res.status(200).json({
                success: true,
                message: '좋아요가 취소되었습니다.',
            });
        } catch (error) {
            logger.error('[Product] 좋아요 취소 에러:', error);
            res.status(500).json({
                success: false,
                message: '좋아요 취소 중 오류가 발생했습니다.',
            });
        }
    },

    // AI 상품 설명 생성 (워크플로우 2단계: 썸네일로 AI 설명 생성)
    async generateDescription(req, res) {
        logger.info('[Product] AI 상품 설명 생성 요청 시작');
        try {
            const { thumbnailUrl } = req.body;

            if (!thumbnailUrl) {
                logger.info('[Product] AI 상품 설명 생성 실패 - thumbnailUrl 누락');
                return res.status(400).json({
                    success: false,
                    message: '썸네일 URL이 필요합니다.',
                });
            }

            // TODO: 실제 AI API 호출 로직 구현
            // 예: OpenAI Vision API, Claude Vision API 등
            // const aiDescription = await callAIService(thumbnailUrl);

            // 임시 응답 (실제로는 AI 서비스 응답을 반환)
            const mockDescription = `이 상품은 고품질의 제품입니다.
상세한 설명이 필요합니다.

## 주요 특징
- 특징 1
- 특징 2
- 특징 3

## 상태
양호한 상태입니다.`;

            logger.info('[Product] AI 상품 설명 생성 성공');
            res.status(200).json({
                success: true,
                message: 'AI 상품 설명이 생성되었습니다.',
                data: {
                    description: mockDescription,
                },
            });
        } catch (error) {
            logger.error('[Product] AI 상품 설명 생성 에러:', error);
            res.status(500).json({
                success: false,
                message: 'AI 상품 설명 생성 중 오류가 발생했습니다.',
            });
        }
    },
};

export default ProductController;
