import ProductModel from '../models/productModel.js';
import JobModel from '../models/jobModel.js';
import { pool } from '../middleware/dbConnection.js';

const ProductController = {
    // 상품 등록
    async createProduct(req, res) {
        const connection = await pool.getConnection();
        try {
            const memberId = req.user?.memberId;
            if (!memberId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { name, price, description, imageUrls } = req.body;

            if (!name || !price) {
                return res.status(400).json({ error: 'Name and price are required' });
            }

            await connection.beginTransaction();

            // 1. 상품 생성
            const productId = await ProductModel.createProductWithConnection(connection, {
                memberId,
                name,
                price,
                description,
            });

            // 2. 이미지 추가
            if (imageUrls && imageUrls.length > 0) {
                await ProductModel.addProductImagesWithConnection(connection, productId, imageUrls);
            }

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

            res.status(201).json({
                message: 'Product created successfully',
                productId,
            });
        } catch (error) {
            await connection.rollback();
            console.error('Create product error:', error);
            res.status(500).json({ error: error.message });
        } finally {
            connection.release();
        }
    },

    // 상품 목록 조회
    async getProductList(req, res) {
        try {
            const { page = 1, limit = 20, status = 'ACTIVE', search = '' } = req.query;

            const result = await ProductModel.getProductList({
                page: parseInt(page),
                limit: parseInt(limit),
                status,
                search,
            });

            res.status(200).json(result);
        } catch (error) {
            console.error('Get product list error:', error);
            res.status(500).json({ error: error.message });
        }
    },

    // 상품 상세 조회
    async getProductById(req, res) {
        try {
            const { productId } = req.params;

            if (!productId) {
                return res.status(400).json({ error: 'Product ID is required' });
            }

            const product = await ProductModel.getProductById(productId);

            if (!product) {
                return res.status(404).json({ error: 'Product not found' });
            }

            // 조회수 증가 (비동기로 처리하고 응답에는 영향 안주기)
            ProductModel.increaseViewCount(productId).catch((err) =>
                console.error('Failed to increase view count:', err)
            );

            res.status(200).json(product);
        } catch (error) {
            console.error('Get product by ID error:', error);
            res.status(500).json({ error: error.message });
        }
    },

    // 상품 수정
    async updateProduct(req, res) {
        try {
            const memberId = req.user?.memberId;
            if (!memberId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { productId } = req.params;
            const updates = req.body;

            if (!productId) {
                return res.status(400).json({ error: 'Product ID is required' });
            }

            // 소유자 확인
            const isOwner = await ProductModel.isProductOwner(productId, memberId);
            if (!isOwner) {
                return res.status(403).json({ error: 'Forbidden: Not the product owner' });
            }

            const updated = await ProductModel.updateProduct(productId, updates);

            if (!updated) {
                return res.status(404).json({ error: 'Product not found or no changes made' });
            }

            res.status(200).json({ message: 'Product updated successfully' });
        } catch (error) {
            console.error('Update product error:', error);
            res.status(500).json({ error: error.message });
        }
    },

    // 상품 삭제
    async deleteProduct(req, res) {
        try {
            const memberId = req.user?.memberId;
            if (!memberId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { productId } = req.params;

            if (!productId) {
                return res.status(400).json({ error: 'Product ID is required' });
            }

            const deleted = await ProductModel.deleteProduct(productId, memberId);

            if (!deleted) {
                return res.status(404).json({
                    error: 'Product not found, already sold, or not authorized',
                });
            }

            res.status(200).json({ message: 'Product deleted successfully' });
        } catch (error) {
            console.error('Delete product error:', error);
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
        try {
            const memberId = req.user?.memberId;
            if (!memberId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { productId } = req.params;

            if (!productId) {
                return res.status(400).json({ error: 'Product ID is required' });
            }

            // 상품 존재 확인
            const product = await ProductModel.getProductById(productId);
            if (!product) {
                return res.status(404).json({ error: 'Product not found' });
            }

            // 좋아요 추가 (중복 체크 포함)
            const result = await ProductModel.addLike(productId, memberId);

            if (!result.success) {
                if (result.reason === 'already_liked') {
                    return res.status(400).json({ error: 'Already liked this product' });
                }
                return res.status(400).json({ error: 'Failed to like product' });
            }

            res.status(200).json({ message: 'Product liked successfully' });
        } catch (error) {
            console.error('Like product error:', error);
            res.status(500).json({ error: error.message });
        }
    },

    // 상품 좋아요 취소
    async unlikeProduct(req, res) {
        try {
            const memberId = req.user?.memberId;
            if (!memberId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { productId } = req.params;

            if (!productId) {
                return res.status(400).json({ error: 'Product ID is required' });
            }

            // 상품 존재 확인
            const product = await ProductModel.getProductById(productId);
            if (!product) {
                return res.status(404).json({ error: 'Product not found' });
            }

            // 좋아요 취소
            const result = await ProductModel.removeLike(productId, memberId);

            if (!result.success) {
                if (result.reason === 'not_liked') {
                    return res.status(400).json({ error: 'Product not liked yet' });
                }
                return res.status(400).json({ error: 'Failed to unlike product' });
            }

            res.status(200).json({ message: 'Product unliked successfully' });
        } catch (error) {
            console.error('Unlike product error:', error);
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
