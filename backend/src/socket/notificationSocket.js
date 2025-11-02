import NotificationModel from '../models/notificationModel.js';
import { authenticateSocket } from './chatSocket.js';
import logger from '../utils/logger.js';

/**
 * 알림 Socket.IO 이벤트 핸들러
 */
export const setupNotificationSocket = (io) => {
    // 인증 미들웨어는 app.js에서 전역으로 적용되므로 여기서는 불필요

    io.on('connection', (socket) => {
        // 알림 룸 입장
        socket.on('join-notifications', async () => {
            try {
                const userRoom = `user:${socket.memberId}`;
                socket.join(userRoom);

                logger.info('사용자가 알림 룸에 입장', { memberId: socket.memberId });

                // 입장 성공 알림 및 현재 읽지 않은 개수 전송
                const unreadCount = await NotificationModel.getUnreadCount(socket.memberId);
                socket.emit('joined-notifications', {
                    success: true,
                    unread_count: unreadCount
                });
            } catch (error) {
                logger.error('알림 룸 입장 오류', error);
                socket.emit('error', { message: '알림 룸 입장 중 오류가 발생했습니다.' });
            }
        });

        // 알림 읽음 처리
        socket.on('mark-notification-read', async ({ notifId }) => {
            try {
                if (!notifId || isNaN(notifId)) {
                    socket.emit('error', { message: '유효한 알림 ID가 필요합니다.' });
                    return;
                }

                const notification = await NotificationModel.markAsRead(parseInt(notifId), socket.memberId);

                if (!notification) {
                    socket.emit('error', { message: '알림을 찾을 수 없거나 이미 읽은 알림입니다.' });
                    return;
                }

                // 읽음 확인 전송
                socket.emit('notification-read', {
                    notif_id: notification.notif_id,
                    is_read: notification.is_read
                });

                // 읽지 않은 개수 업데이트
                const unreadCount = await NotificationModel.getUnreadCount(socket.memberId);
                socket.emit('unread-count-updated', { count: unreadCount });

                logger.info('알림 읽음 처리', { memberId: socket.memberId, notifId });
            } catch (error) {
                logger.error('알림 읽음 처리 오류', error);
                socket.emit('error', { message: '알림 읽음 처리 중 오류가 발생했습니다.' });
            }
        });

        // 모든 알림 읽음 처리
        socket.on('mark-all-read', async () => {
            try {
                const count = await NotificationModel.markAllAsRead(socket.memberId);

                // 읽지 않은 개수 업데이트 (0이어야 함)
                const unreadCount = await NotificationModel.getUnreadCount(socket.memberId);
                socket.emit('unread-count-updated', { count: unreadCount });

                logger.info('전체 알림 읽음 처리', { memberId: socket.memberId, count });
            } catch (error) {
                logger.error('전체 알림 읽음 처리 오류', error);
                socket.emit('error', { message: '전체 알림 읽음 처리 중 오류가 발생했습니다.' });
            }
        });
    });

    return io;
};

/**
 * 알림 전송 헬퍼 함수
 * 다른 모듈에서 사용자에게 알림을 보낼 때 호출
 *
 * @param {Object} io - Socket.IO 인스턴스
 * @param {Number} memberId - 알림을 받을 사용자 ID
 * @param {Object} notificationData - 알림 데이터
 * @param {String} notificationData.type - 알림 타입
 * @param {String} notificationData.title - 알림 제목
 * @param {String} notificationData.message - 알림 내용
 * @param {String} notificationData.product_id - 관련 상품 ID (옵션)
 * @returns {Promise<Object>} 생성된 알림 객체
 */
export const sendNotification = async (io, memberId, notificationData) => {
    try {
        const { type, title, message, product_id = null } = notificationData;

        // 알림 타입 검증
        if (!NotificationModel.isValidType(type)) {
            logger.error('유효하지 않은 알림 타입', { type });
            return null;
        }

        // DB에 알림 저장
        const notification = await NotificationModel.createNotification(
            memberId,
            type,
            title,
            message,
            product_id
        );

        // 상품 정보가 있는 경우 조회하여 추가
        let enrichedNotification = { ...notification };
        if (product_id) {
            const notificationWithProduct = await NotificationModel.getNotificationById(
                notification.notif_id,
                memberId
            );
            enrichedNotification = notificationWithProduct || notification;
        }

        // Socket.IO를 통해 실시간 알림 전송
        io.to(`user:${memberId}`).emit('new-notification', enrichedNotification);

        // 읽지 않은 개수 업데이트
        const unreadCount = await NotificationModel.getUnreadCount(memberId);
        io.to(`user:${memberId}`).emit('unread-count-updated', { count: unreadCount });

        logger.info('알림 전송 완료', { memberId, type });

        return enrichedNotification;
    } catch (error) {
        logger.error('알림 전송 오류', error);
        return null;
    }
};
