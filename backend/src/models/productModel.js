import { pool } from '../middleware/dbConnection.js';

const ProductModel = {
    // 상품 목록 조회
    async getProductList() {
        // TODO: 구현 필요
        return [];
    },

    // 상품 상세 조회
    async getProductById(productId) {
        // TODO: 구현 필요
        return null;
    },

    // 상품 생성
    async createProduct({ memberId, name, price, description }) {
        // TODO: UUID 생성 및 구현 필요
        return null;
    },

    // 상품 수정
    async updateProduct(productId, updates) {
        // TODO: 구현 필요
        return false;
    },

    // 상품 삭제 (소프트 삭제)
    async deleteProduct(productId, memberId) {
        // TODO: sell_status를 DELETED로 변경
        return false;
    },

    // 내 판매 내역 조회
    async getMyProducts(memberId, status) {
        // TODO: 상태별 필터링 구현
        return [];
    },

    // 조회수 증가
    async increaseViewCount(productId) {
        // TODO: 구현 필요
        return false;
    },

    // 좋아요 수 증가
    async increaseLikeCount(productId) {
        // TODO: 구현 필요
        return false;
    },

    // 좋아요 수 감소
    async decreaseLikeCount(productId) {
        // TODO: 구현 필요
        return false;
    },
};

export default ProductModel;
