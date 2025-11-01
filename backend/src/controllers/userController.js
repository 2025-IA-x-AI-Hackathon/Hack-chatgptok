import UserModel from '../models/userModel.js';

const UserController = {
    // 회원가입
    async signup(req, res) {
        try {
            // TODO: 구현 필요
            res.status(501).json({ error: 'Not implemented yet' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // 로그인
    async login(req, res) {
        try {
            // TODO: JWT 기반 인증 구현 필요
            res.status(501).json({ error: 'Not implemented yet' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // 로그아웃
    async logout(req, res) {
        try {
            // TODO: 구현 필요
            res.status(501).json({ error: 'Not implemented yet' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // 프로필 조회
    async getProfile(req, res) {
        try {
            // JWT 미들웨어에서 설정한 req.user.userId 사용
            const userId = req.user.userId;

            const user = await UserModel.findById(userId);

            if (!user) {
                return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
            }

            res.status(200).json({
                user: {
                    member_id: user.member_id,
                    email: user.email,
                    nickname: user.nickname,
                    img: user.img,
                    created_at: user.created_at,
                    updated_at: user.updated_at
                }
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // 프로필 수정
    async updateProfile(req, res) {
        try {
            const userId = req.user.userId;
            const { nickname, password, img } = req.body;

            // 업데이트할 필드만 추출
            const updates = {};
            if (nickname !== undefined) updates.nickname = nickname;
            if (password !== undefined) updates.password = password;
            if (img !== undefined) updates.img = img;

            if (Object.keys(updates).length === 0) {
                return res.status(400).json({ error: '업데이트할 정보가 없습니다.' });
            }

            const success = await UserModel.updateUser(userId, updates);

            if (!success) {
                return res.status(400).json({ error: '프로필 업데이트에 실패했습니다.' });
            }

            // 업데이트된 사용자 정보 조회
            const updatedUser = await UserModel.findById(userId);

            res.status(200).json({
                message: '프로필이 성공적으로 업데이트되었습니다.',
                user: {
                    member_id: updatedUser.member_id,
                    email: updatedUser.email,
                    nickname: updatedUser.nickname,
                    img: updatedUser.img,
                    created_at: updatedUser.created_at,
                    updated_at: updatedUser.updated_at
                }
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
};

export default UserController;
