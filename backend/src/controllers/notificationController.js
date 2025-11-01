import NotificationModel from '../models/notificationModel.js';
import logger from '../utils/logger.js';

const notificationController = {
    // 알림 목록 조회
    async getNotifications(req, res) {
        try {
            const memberId = req.user.memberId;
            const limit = parseInt(req.query.limit) || 20;
            const offset = parseInt(req.query.offset) || 0;
            const unreadOnly = req.query.unreadOnly === 'true';

            // 유효성 검증
            if (limit < 1 || limit > 100) {
                return res.status(400).json({
                    success: false,
                    message: 'limit은 1에서 100 사이의 값이어야 합니다.'
                });
            }

            if (offset < 0) {
                return res.status(400).json({
                    success: false,
                    message: 'offset은 0 이상이어야 합니다.'
                });
            }

            const result = await NotificationModel.getNotificationsByUser(
                memberId,
                limit,
                offset,
                unreadOnly
            );

            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            logger.error('알림 목록 조회 오류', error);
            res.status(500).json({
                success: false,
                message: '서버 오류가 발생했습니다.'
            });
        }
    },

    // 특정 알림 읽음 처리
    async markAsRead(req, res) {
        try {
            const { notifId } = req.params;
            const memberId = req.user.memberId;

            if (!notifId || isNaN(notifId)) {
                return res.status(400).json({
                    success: false,
                    message: '유효한 알림 ID가 필요합니다.'
                });
            }

            const notification = await NotificationModel.markAsRead(parseInt(notifId), memberId);

            if (!notification) {
                return res.status(404).json({
                    success: false,
                    message: '알림을 찾을 수 없거나 이미 읽은 알림입니다.'
                });
            }

            res.status(200).json({
                success: true,
                data: {
                    notif_id: notification.notif_id,
                    is_read: notification.is_read
                }
            });
        } catch (error) {
            logger.error('알림 읽음 처리 오류', error);
            res.status(500).json({
                success: false,
                message: '서버 오류가 발생했습니다.'
            });
        }
    },

    // 모든 알림 읽음 처리
    async markAllAsRead(req, res) {
        try {
            const memberId = req.user.memberId;

            const count = await NotificationModel.markAllAsRead(memberId);

            res.status(200).json({
                success: true,
                data: {
                    count
                }
            });
        } catch (error) {
            logger.error('전체 알림 읽음 처리 오류', error);
            res.status(500).json({
                success: false,
                message: '서버 오류가 발생했습니다.'
            });
        }
    },

    // 알림 삭제
    async deleteNotification(req, res) {
        try {
            const { notifId } = req.params;
            const memberId = req.user.memberId;

            if (!notifId || isNaN(notifId)) {
                return res.status(400).json({
                    success: false,
                    message: '유효한 알림 ID가 필요합니다.'
                });
            }

            const deleted = await NotificationModel.deleteNotification(parseInt(notifId), memberId);

            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    message: '알림을 찾을 수 없습니다.'
                });
            }

            res.status(200).json({
                success: true,
                message: '알림이 삭제되었습니다.'
            });
        } catch (error) {
            logger.error('알림 삭제 오류', error);
            res.status(500).json({
                success: false,
                message: '서버 오류가 발생했습니다.'
            });
        }
    },

    // 읽지 않은 알림 개수 조회
    async getUnreadCount(req, res) {
        try {
            const memberId = req.user.memberId;

            const count = await NotificationModel.getUnreadCount(memberId);

            res.status(200).json({
                success: true,
                data: {
                    count
                }
            });
        } catch (error) {
            logger.error('읽지 않은 알림 개수 조회 오류', error);
            res.status(500).json({
                success: false,
                message: '서버 오류가 발생했습니다.'
            });
        }
    }
};

export default notificationController;
