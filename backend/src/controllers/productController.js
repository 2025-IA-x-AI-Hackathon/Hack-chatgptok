import ProductModel from '../models/productModel.js';

const ProductController = {
    // 상품 등록
    async createProduct(req, res) {
        try {
            const memberId = req.user?.memberId;
            if (!memberId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { name, price, description, imageUrls } = req.body;

            if (!name || !price) {
                return res.status(400).json({ error: 'Name and price are required' });
            }

            // 상품 생성
            const productId = await ProductModel.createProduct({
                memberId,
                name,
                price,
                description,
            });

            // 이미지 추가
            if (imageUrls && imageUrls.length > 0) {
                await ProductModel.addProductImages(productId, imageUrls);
            }

            // TODO: AI 상품 설명 자동 생성 큐 등록
            // TODO: 3DGS 작업 큐 등록

            res.status(201).json({
                message: 'Product created successfully',
                productId,
            });
        } catch (error) {
            console.error('Create product error:', error);
            res.status(500).json({ error: error.message });
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
};

export default ProductController;
