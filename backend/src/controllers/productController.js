import ProductModel from '../models/productModel.js';
import JobModel from '../models/jobModel.js';
import { pool } from '../middleware/dbConnection.js';

const ProductController = {
    // 상품 등록
    async createProduct(req, res) {
        console.log('[Product] 상품 등록 요청 시작 - memberId:', req.user?.memberId);
        const connection = await pool.getConnection();
        try {
            const memberId = req.user?.memberId;
            if (!memberId) {
                console.log('[Product] 상품 등록 실패 - 인증되지 않은 사용자');
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { name, price, description, imageUrls } = req.body;
            console.log('[Product] 상품 정보:', { name, price, imageCount: imageUrls?.length || 0 });

            if (!name || !price) {
                console.log('[Product] 상품 등록 실패 - 필수 항목 누락');
                return res.status(400).json({ error: 'Name and price are required' });
            }

            // 이미지 URL 확인
            if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
                return res.status(400).json({ error: 'At least one image URL is required' });
            }

            await connection.beginTransaction();
            console.log('[Product] 트랜잭션 시작');

            // 1. 상품 생성
            const productId = await ProductModel.createProductWithConnection(connection, {
                memberId,
                name,
                price,
                description,
            });
            console.log('[Product] 상품 생성 완료 - productId:', productId);

            // 2. 이미지 URL DB 저장
            await ProductModel.addProductImagesWithConnection(connection, productId, imageUrls);

            // 3. AI 상품 설명 자동 생성 큐 등록
            // await JobModel.createDescriptionJobWithConnection(connection, productId);

            // 4. 3DGS 작업 큐 등록
            // await JobModel.create3DGSJobWithConnection(connection, productId);

            // 5. 외부 API 호출 (트랜잭션 내부)
            // 외부 API 호출 실패시 전체 트랜잭션 롤백
            // await JobModel.notifyWorker('description', productId);
            // await JobModel.notifyWorker('3dgs', productId);

            // 트랜잭션 커밋 (모든 작업 완료)
            await connection.commit();
            console.log('[Product] 트랜잭션 커밋 완료 - productId:', productId);

            res.status(201).json({
                message: 'Product created successfully',
                productId,
                imageUrls,
            });
        } catch (error) {
            await connection.rollback();
            console.error('[Product] 상품 등록 에러 (롤백):', error);
            res.status(500).json({ error: error.message });
        } finally {
            connection.release();
        }
    },

    // 상품 목록 조회
    async getProductList(req, res) {
        const { page = 1, limit = 20, status = 'ACTIVE', search = '' } = req.query;
        console.log('[Product] 상품 목록 조회 - page:', page, 'limit:', limit, 'status:', status, 'search:', search);
        try {
            const result = await ProductModel.getProductList({
                page: parseInt(page),
                limit: parseInt(limit),
                status,
                search,
            });

            console.log('[Product] 상품 목록 조회 완료 - 결과 개수:', result.products?.length || 0);
            res.status(200).json(result);
        } catch (error) {
            console.error('[Product] 상품 목록 조회 에러:', error);
            res.status(500).json({ error: error.message });
        }
    },

    // 상품 상세 조회
    async getProductById(req, res) {
        const { productId } = req.params;
        console.log('[Product] 상품 상세 조회 - productId:', productId);
        try {
            if (!productId) {
                console.log('[Product] 상품 조회 실패 - productId 누락');
                return res.status(400).json({ error: 'Product ID is required' });
            }

            const product = await ProductModel.getProductById(productId);

            if (!product) {
                console.log('[Product] 상품 조회 실패 - 상품 없음, productId:', productId);
                return res.status(404).json({ error: 'Product not found' });
            }

            console.log('[Product] 상품 조회 성공 - productId:', productId, 'name:', product.name);

            // 조회수 증가 (비동기로 처리하고 응답에는 영향 안주기)
            ProductModel.increaseViewCount(productId).catch((err) =>
                console.error('[Product] 조회수 증가 실패:', err)
            );

            res.status(200).json(product);
        } catch (error) {
            console.error('[Product] 상품 조회 에러:', error);
            res.status(500).json({ error: error.message });
        }
    },

    // 상품 수정
    async updateProduct(req, res) {
        const { productId } = req.params;
        console.log('[Product] 상품 수정 요청 - productId:', productId, 'memberId:', req.user?.memberId);
        try {
            const memberId = req.user?.memberId;
            if (!memberId) {
                console.log('[Product] 상품 수정 실패 - 인증되지 않은 사용자');
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const updates = req.body;

            if (!productId) {
                console.log('[Product] 상품 수정 실패 - productId 누락');
                return res.status(400).json({ error: 'Product ID is required' });
            }

            // 소유자 확인
            const isOwner = await ProductModel.isProductOwner(productId, memberId);
            if (!isOwner) {
                console.log('[Product] 상품 수정 실패 - 권한 없음, productId:', productId, 'memberId:', memberId);
                return res.status(403).json({ error: 'Forbidden: Not the product owner' });
            }

            const updated = await ProductModel.updateProduct(productId, updates);

            if (!updated) {
                console.log('[Product] 상품 수정 실패 - 상품 없음 또는 변경사항 없음, productId:', productId);
                return res.status(404).json({ error: 'Product not found or no changes made' });
            }

            console.log('[Product] 상품 수정 성공 - productId:', productId);
            res.status(200).json({ message: 'Product updated successfully' });
        } catch (error) {
            console.error('[Product] 상품 수정 에러:', error);
            res.status(500).json({ error: error.message });
        }
    },

    // 상품 삭제
    async deleteProduct(req, res) {
        const { productId } = req.params;
        console.log('[Product] 상품 삭제 요청 - productId:', productId, 'memberId:', req.user?.memberId);
        try {
            const memberId = req.user?.memberId;
            if (!memberId) {
                console.log('[Product] 상품 삭제 실패 - 인증되지 않은 사용자');
                return res.status(401).json({ error: 'Unauthorized' });
            }

            if (!productId) {
                console.log('[Product] 상품 삭제 실패 - productId 누락');
                return res.status(400).json({ error: 'Product ID is required' });
            }

            const deleted = await ProductModel.deleteProduct(productId, memberId);

            if (!deleted) {
                console.log('[Product] 상품 삭제 실패 - 상품 없음/판매완료/권한없음, productId:', productId);
                return res.status(404).json({
                    error: 'Product not found, already sold, or not authorized',
                });
            }

            console.log('[Product] 상품 삭제 성공 - productId:', productId);
            res.status(200).json({ message: 'Product deleted successfully' });
        } catch (error) {
            console.error('[Product] 상품 삭제 에러:', error);
            res.status(500).json({ error: error.message });
        }
    },

    // 내 판매 내역 조회
    async getMyProducts(req, res) {
        try {
            const memberId = req.user?.memberId;
            if (!memberId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { status } = req.query;

            const products = await ProductModel.getMyProducts(memberId, status);

            res.status(200).json({ products });
        } catch (error) {
            console.error('Get my products error:', error);
            res.status(500).json({ error: error.message });
        }
    },

    // 상품 좋아요 추가
    async likeProduct(req, res) {
        const { productId } = req.params;
        console.log('[Product] 좋아요 추가 요청 - productId:', productId, 'memberId:', req.user?.memberId);
        try {
            const memberId = req.user?.memberId;
            if (!memberId) {
                console.log('[Product] 좋아요 추가 실패 - 인증되지 않은 사용자');
                return res.status(401).json({ error: 'Unauthorized' });
            }

            if (!productId) {
                console.log('[Product] 좋아요 추가 실패 - productId 누락');
                return res.status(400).json({ error: 'Product ID is required' });
            }

            // 상품 존재 확인
            const product = await ProductModel.getProductById(productId);
            if (!product) {
                console.log('[Product] 좋아요 추가 실패 - 상품 없음, productId:', productId);
                return res.status(404).json({ error: 'Product not found' });
            }

            // 좋아요 추가 (중복 체크 포함)
            const result = await ProductModel.addLike(productId, memberId);

            if (!result.success) {
                if (result.reason === 'already_liked') {
                    console.log('[Product] 좋아요 추가 실패 - 이미 좋아요함, productId:', productId);
                    return res.status(400).json({ error: 'Already liked this product' });
                }
                console.log('[Product] 좋아요 추가 실패 - reason:', result.reason);
                return res.status(400).json({ error: 'Failed to like product' });
            }

            console.log('[Product] 좋아요 추가 성공 - productId:', productId);
            res.status(200).json({ message: 'Product liked successfully' });
        } catch (error) {
            console.error('[Product] 좋아요 추가 에러:', error);
            res.status(500).json({ error: error.message });
        }
    },

    // 상품 좋아요 취소
    async unlikeProduct(req, res) {
        const { productId } = req.params;
        console.log('[Product] 좋아요 취소 요청 - productId:', productId, 'memberId:', req.user?.memberId);
        try {
            const memberId = req.user?.memberId;
            if (!memberId) {
                console.log('[Product] 좋아요 취소 실패 - 인증되지 않은 사용자');
                return res.status(401).json({ error: 'Unauthorized' });
            }

            if (!productId) {
                console.log('[Product] 좋아요 취소 실패 - productId 누락');
                return res.status(400).json({ error: 'Product ID is required' });
            }

            // 상품 존재 확인
            const product = await ProductModel.getProductById(productId);
            if (!product) {
                console.log('[Product] 좋아요 취소 실패 - 상품 없음, productId:', productId);
                return res.status(404).json({ error: 'Product not found' });
            }

            // 좋아요 취소
            const result = await ProductModel.removeLike(productId, memberId);

            if (!result.success) {
                if (result.reason === 'not_liked') {
                    console.log('[Product] 좋아요 취소 실패 - 좋아요 안했음, productId:', productId);
                    return res.status(400).json({ error: 'Product not liked yet' });
                }
                console.log('[Product] 좋아요 취소 실패 - reason:', result.reason);
                return res.status(400).json({ error: 'Failed to unlike product' });
            }

            console.log('[Product] 좋아요 취소 성공 - productId:', productId);
            res.status(200).json({ message: 'Product unliked successfully' });
        } catch (error) {
            console.error('[Product] 좋아요 취소 에러:', error);
            res.status(500).json({ error: error.message });
        }
    },

    // AI 상품 설명 생성 (워크플로우 2단계: 썸네일로 AI 설명 생성)
    async generateDescription(req, res) {
        try {
            const { thumbnailUrl } = req.body;

            if (!thumbnailUrl) {
                return res.status(400).json({ error: 'Thumbnail URL is required' });
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

            res.status(200).json({
                description: mockDescription,
                message: 'AI description generated successfully',
            });
        } catch (error) {
            console.error('Generate description error:', error);
            res.status(500).json({ error: error.message });
        }
    },
};

export default ProductController;
