import { pool } from '../middleware/dbConnection.js';

const NotificationModel = {
    // 알림 생성
    async createNotification(memberId, type, title, message, productId = null) {
        const query = `
            INSERT INTO notification (member_id, type, title, message, product_id, created_at, is_read)
            VALUES (?, ?, ?, ?, ?, ?, FALSE)
        `;
        const now = new Date();

        const [result] = await pool.query(query, [memberId, type, title, message, productId, now]);

        // 생성된 알림 조회
        const [notifications] = await pool.query(
            'SELECT * FROM notification WHERE notif_id = ?',
            [result.insertId]
        );

        return notifications[0];
    },

    // 사용자 알림 목록 조회
    async getNotificationsByUser(memberId, limit = 20, offset = 0, unreadOnly = false) {
        let query = `
            SELECT
                n.*,
                p.name as product_name,
                (SELECT s3_key FROM product_image WHERE product_id = p.product_id ORDER BY sort_order LIMIT 1) as product_thumbnail
            FROM notification n
            LEFT JOIN product p ON n.product_id = p.product_id
            WHERE n.member_id = ?
        `;

        const params = [memberId];

        if (unreadOnly) {
            query += ' AND n.is_read = FALSE';
        }

        query += ' ORDER BY n.created_at DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const [notifications] = await pool.query(query, params);

        // 전체 개수 및 읽지 않은 개수 조회
        const [countResult] = await pool.query(
            `SELECT
                COUNT(*) as total_count,
                SUM(CASE WHEN is_read = FALSE THEN 1 ELSE 0 END) as unread_count
            FROM notification
            WHERE member_id = ?`,
            [memberId]
        );

        return {
            notifications,
            unread_count: parseInt(countResult[0].unread_count) || 0,
            total_count: parseInt(countResult[0].total_count) || 0
        };
    },

    // 특정 알림 조회
    async getNotificationById(notifId, memberId) {
        const query = `
            SELECT
                n.*,
                p.name as product_name,
                (SELECT s3_key FROM product_image WHERE product_id = p.product_id ORDER BY sort_order LIMIT 1) as product_thumbnail
            FROM notification n
            LEFT JOIN product p ON n.product_id = p.product_id
            WHERE n.notif_id = ? AND n.member_id = ?
        `;

        const [notifications] = await pool.query(query, [notifId, memberId]);
        return notifications.length > 0 ? notifications[0] : null;
    },

    // 알림 읽음 처리
    async markAsRead(notifId, memberId) {
        const query = `
            UPDATE notification
            SET is_read = TRUE
            WHERE notif_id = ? AND member_id = ? AND is_read = FALSE
        `;

        const [result] = await pool.query(query, [notifId, memberId]);

        if (result.affectedRows === 0) {
            return null;
        }

        // 업데이트된 알림 조회
        return await this.getNotificationById(notifId, memberId);
    },

    // 모든 알림 읽음 처리
    async markAllAsRead(memberId) {
        const query = `
            UPDATE notification
            SET is_read = TRUE
            WHERE member_id = ? AND is_read = FALSE
        `;

        const [result] = await pool.query(query, [memberId]);
        return result.affectedRows;
    },

    // 알림 삭제
    async deleteNotification(notifId, memberId) {
        const query = `
            DELETE FROM notification
            WHERE notif_id = ? AND member_id = ?
        `;

        const [result] = await pool.query(query, [notifId, memberId]);
        return result.affectedRows > 0;
    },

    // 읽지 않은 알림 개수
    async getUnreadCount(memberId) {
        const query = `
            SELECT COUNT(*) as count
            FROM notification
            WHERE member_id = ? AND is_read = FALSE
        `;

        const [result] = await pool.query(query, [memberId]);
        return parseInt(result[0].count) || 0;
    },

    // 알림 타입 검증
    isValidType(type) {
        const validTypes = [
            'CHAT_MESSAGE',
            'PRODUCT_LIKE',
            'PRODUCT_SOLD',
            'JOB_COMPLETED',
            'FAULT_ANALYSIS',
            'SYSTEM'
        ];
        return validTypes.includes(type);
    }
};

export default NotificationModel;
