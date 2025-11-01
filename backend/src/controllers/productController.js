import ProductModel from '../models/productModel.js';

const ProductController = {
    // 상품 등록
    async createProduct(req, res) {
        try {
            // TODO: 15~25장 이미지 업로드 처리 필요
            // TODO: AI 상품 설명 자동 생성 큐 등록
            // TODO: 3DGS 작업 큐 등록
            res.status(501).json({ error: 'Not implemented yet' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // 상품 목록 조회
    async getProductList(req, res) {
        try {
            // TODO: 구현 필요
            res.status(501).json({ error: 'Not implemented yet' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // 상품 상세 조회
    async getProductById(req, res) {
        try {
            // TODO: 구현 필요
            res.status(501).json({ error: 'Not implemented yet' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // 상품 수정
    async updateProduct(req, res) {
        try {
            // TODO: 구현 필요
            res.status(501).json({ error: 'Not implemented yet' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // 상품 삭제
    async deleteProduct(req, res) {
        try {
            // TODO: 구현 필요
            res.status(501).json({ error: 'Not implemented yet' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // 내 판매 내역 조회
    async getMyProducts(req, res) {
        try {
            // TODO: 상태별 필터 지원 (DRAFT, PROCESSING, ACTIVE)
            res.status(501).json({ error: 'Not implemented yet' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
};

export default ProductController;
