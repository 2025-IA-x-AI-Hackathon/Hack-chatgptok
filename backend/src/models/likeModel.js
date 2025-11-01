import { pool } from '../middleware/dbConnection.js';

const LikeModel = {
    // 좋아요 생성
    async createLike(memberId, productId) {
        // TODO: 구현 필요
        return null;
    },

    // 특정 상품의 좋아요 목록 조회
    async getLikesByProduct(productId) {
        // TODO: 구현 필요
        return [];
    },

    // 사용자가 좋아요 했는지 확인
    async checkLike(memberId, productId) {
        // TODO: 구현 필요
        return false;
    },

    // 좋아요 삭제
    async deleteLike(memberId, productId) {
        // TODO: 구현 필요
        return false;
    },
};

export default LikeModel;
