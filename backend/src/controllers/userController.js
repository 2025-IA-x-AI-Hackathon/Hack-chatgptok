import UserModel from '../models/userModel.js';
import { getPresignedUrl } from '../config/s3.js';
import logger from '../utils/logger.js';

const UserController = {
    // 내 정보 조회
    async getMe(req, res) {
        logger.info('[User] 내 정보 조회 요청', { memberId: req.user?.memberId });
        try {
            const memberId = req.user?.memberId;
            if (!memberId) {
                logger.warn('[User] 내 정보 조회 실패 - 인증되지 않은 사용자');
                return res.status(401).json({
                    success: false,
                    message: '인증이 필요합니다.',
                });
            }

            const user = await UserModel.findById(memberId);

            if (!user) {
                logger.warn('[User] 내 정보 조회 실패 - 사용자 없음', { memberId });
                return res.status(404).json({
                    success: false,
                    message: '사용자를 찾을 수 없습니다.',
                });
            }

            // img를 presigned URL로 변환
            let imgUrl = null;
            if (user.img) {
                try {
                    imgUrl = await getPresignedUrl(user.img);
                } catch (error) {
                    logger.error('[User] Presigned URL 생성 실패', error, { s3_key: user.img });
                    imgUrl = null;
                }
            }

            // 비밀번호 제외하고 응답
            const userResponse = {
                member_id: user.member_id,
                email: user.email,
                nickname: user.nickname,
                img_url: imgUrl,
                created_at: user.created_at,
                updated_at: user.updated_at,
            };

            logger.info('[User] 내 정보 조회 성공', { memberId });
            res.status(200).json({
                success: true,
                message: '내 정보 조회에 성공했습니다.',
                data: {
                    user: userResponse,
                },
            });
        } catch (error) {
            logger.error('[User] 내 정보 조회 에러', error);
            res.status(500).json({
                success: false,
                message: '내 정보 조회 중 오류가 발생했습니다.',
            });
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
            logger.error('[User] logout 에러', error);
            res.status(500).json({
                success: false,
                message: '로그아웃 중 오류가 발생했습니다.',
            });
        }
    },

    // 사용자 프로필 조회 (다른 사용자 프로필 조회 가능)
    async getProfile(req, res) {
        logger.info('[User] 사용자 프로필 조회 요청', { userId: req.params.userId });
        try {
            // URL 파라미터에서 userId 가져오기
            const targetUserId = req.params.userId;

            if (!targetUserId) {
                logger.warn('[User] 사용자 프로필 조회 실패 - userId 파라미터 누락');
                return res.status(400).json({
                    success: false,
                    message: '사용자 ID가 필요합니다.'
                });
            }

            const user = await UserModel.findById(targetUserId);

            if (!user) {
                logger.warn('[User] 사용자 프로필 조회 실패 - 사용자 없음', { userId: targetUserId });
                return res.status(404).json({
                    success: false,
                    message: '사용자를 찾을 수 없습니다.'
                });
            }

            // img를 presigned URL로 변환
            let imgUrl = null;
            if (user.img) {
                try {
                    imgUrl = await getPresignedUrl(user.img);
                } catch (error) {
                    logger.error('[User] Presigned URL 생성 실패', error, { s3_key: user.img });
                    imgUrl = null;
                }
            }

            // 비밀번호 제외하고 응답
            const userResponse = {
                member_id: user.member_id,
                email: user.email,
                nickname: user.nickname,
                img_url: imgUrl,
                created_at: user.created_at,
                updated_at: user.updated_at
            };

            logger.info('[User] 사용자 프로필 조회 성공', { userId: targetUserId });
            res.status(200).json({
                success: true,
                data: {
                    user: userResponse
                }
            });
        } catch (error) {
            logger.error('[User] 사용자 프로필 조회 에러', error);
            res.status(500).json({
                success: false,
                message: '사용자 프로필 조회 중 오류가 발생했습니다.'
            });
        }
    },

    // 프로필 수정
    async updateProfile(req, res) {
        try {
            const memberId = req.user.memberId;
            const { nickname, password, img } = req.body;

            // 업데이트할 필드만 추출
            const updates = {};
            if (nickname !== undefined) updates.nickname = nickname;
            if (password !== undefined) updates.password = password;
            // img는 S3 key로 저장 (클라이언트에서 업로드 후 받은 key 값을 전달)
            if (img !== undefined) updates.img = img;

            if (Object.keys(updates).length === 0) {
                logger.warn('[User] 프로필 수정 실패 - 업데이트할 정보가 없음', { memberId });
                return res.status(400).json({
                    success: false,
                    message: '업데이트할 정보가 없습니다.'
                });
            }

            const success = await UserModel.updateUser(memberId, updates);

            if (!success) {
                logger.warn('[User] 프로필 수정 실패 - 사용자 없음 또는 변경사항 없음', { memberId });
                return res.status(400).json({
                    success: false,
                    message: '프로필 업데이트에 실패했습니다.'
                });
            }

            // 업데이트된 사용자 정보 조회
            const updatedUser = await UserModel.findById(memberId);

            // img를 presigned URL로 변환
            let imgUrl = null;
            if (updatedUser.img) {
                try {
                    imgUrl = await getPresignedUrl(updatedUser.img);
                } catch (error) {
                    logger.error('[User] Presigned URL 생성 실패', error, { s3_key: updatedUser.img });
                    imgUrl = null;
                }
            }

            const userResponse = {
                member_id: updatedUser.member_id,
                email: updatedUser.email,
                nickname: updatedUser.nickname,
                img_url: imgUrl,
                created_at: updatedUser.created_at,
                updated_at: updatedUser.updated_at
            };

            res.status(200).json({
                success: true,
                message: '프로필이 성공적으로 업데이트되었습니다.',
                data: {
                    user: userResponse
                }
            });
        } catch (error) {
            logger.error('[User] 프로필 수정 에러', error);
            res.status(500).json({
                success: false,
                message: '프로필 수정 중 오류가 발생했습니다.',
            });
        }
    },
};

export default UserController;
