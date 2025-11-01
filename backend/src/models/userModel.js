import { pool } from '../middleware/dbConnection.js';

const UserModel = {
    // 회원가입
    async createUser({ email, password, nickname, img }) {
        // TODO: 구현 필요
        return null;
    },

    // 이메일로 사용자 조회
    async findByEmail(email) {
        // TODO: 구현 필요
        return null;
    },

    // ID로 사용자 조회
    async findById(userId) {
        // TODO: 구현 필요
        return null;
    },

    // 사용자 정보 업데이트
    async updateUser(userId, updates) {
        // TODO: 구현 필요
        return false;
    },

    // 사용자 삭제
    async deleteUser(userId) {
        // TODO: 구현 필요
        return false;
    },
};

export default UserModel;
