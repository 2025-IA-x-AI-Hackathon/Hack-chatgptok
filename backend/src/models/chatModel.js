import { pool } from '../middleware/dbConnection.js';

const ChatModel = {
    // 채팅방 생성 또는 기존 채팅방 조회
    async getOrCreateChatRoom(productId, buyerId) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // 상품 정보로 판매자 ID 조회
            const [products] = await connection.query(
                'SELECT member_id FROM product WHERE product_id = ?',
                [productId]
            );

            if (products.length === 0) {
                throw new Error('상품을 찾을 수 없습니다.');
            }

            const sellerId = products[0].member_id;

            // 기존 채팅방이 있는지 확인
            const [existingRooms] = await connection.query(
                `SELECT * FROM chat_room WHERE product_id = ? AND buyer_id = ?`,
                [productId, buyerId]
            );

            if (existingRooms.length > 0) {
                await connection.commit();
                return existingRooms[0];
            }

            // 새 채팅방 생성
            const now = new Date();

            const [result] = await connection.query(
                `INSERT INTO chat_room (product_id, buyer_id, created_at, updated_at)
                VALUES (?, ?, ?, ?)`,
                [productId, buyerId, now, now]
            );

            const [newRoom] = await connection.query(
                'SELECT * FROM chat_room WHERE room_id = ?',
                [result.insertId]
            );

            await connection.commit();
            return newRoom[0];
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    // 사용자의 채팅방 목록 조회
    async getChatRoomsByUser(memberId) {
        const query = `
            SELECT
                cr.room_id,
                cr.product_id,
                cr.buyer_id,
                p.member_id as seller_id,
                cr.created_at,
                cr.updated_at,
                p.name as product_name,
                p.price as product_price,
                (SELECT s3_url FROM product_image WHERE product_id = p.product_id ORDER BY sort_order LIMIT 1) as product_thumbnail,
                CASE
                    WHEN cr.buyer_id = ? THEN seller.nickname
                    ELSE buyer.nickname
                END as other_user_name,
                CASE
                    WHEN cr.buyer_id = ? THEN seller.img
                    ELSE buyer.img
                END as other_user_img,
                CASE
                    WHEN cr.buyer_id = ? THEN p.member_id
                    ELSE cr.buyer_id
                END as other_user_id,
                CASE
                    WHEN cr.buyer_id = ? THEN 'buyer'
                    ELSE 'seller'
                END as user_type,
                (SELECT content FROM chat_message WHERE room_id = cr.room_id ORDER BY created_at DESC LIMIT 1) as last_message,
                (SELECT created_at FROM chat_message WHERE room_id = cr.room_id ORDER BY created_at DESC LIMIT 1) as last_message_time,
                (SELECT COUNT(*) FROM chat_message WHERE room_id = cr.room_id AND sender_id != ? AND is_read = FALSE) as unread_count
            FROM chat_room cr
            JOIN product p ON cr.product_id = p.product_id
            JOIN member buyer ON cr.buyer_id = buyer.member_id
            JOIN member seller ON p.member_id = seller.member_id
            WHERE cr.buyer_id = ? OR p.member_id = ?
            ORDER BY cr.updated_at DESC
        `;

        const [rooms] = await pool.query(query, [memberId, memberId, memberId, memberId, memberId, memberId, memberId]);
        return rooms;
    },

    // 채팅방 상세 정보 조회
    async getChatRoomById(chatRoomId, memberId) {
        const query = `
            SELECT
                cr.room_id,
                cr.product_id,
                cr.buyer_id,
                p.member_id as seller_id,
                cr.created_at,
                cr.updated_at,
                p.name as product_name,
                p.price as product_price,
                (SELECT s3_url FROM product_image WHERE product_id = p.product_id ORDER BY sort_order LIMIT 1) as product_thumbnail,
                CASE
                    WHEN cr.buyer_id = ? THEN seller.nickname
                    ELSE buyer.nickname
                END as other_user_name,
                CASE
                    WHEN cr.buyer_id = ? THEN seller.img
                    ELSE buyer.img
                END as other_user_img,
                CASE
                    WHEN cr.buyer_id = ? THEN p.member_id
                    ELSE cr.buyer_id
                END as other_user_id,
                buyer.nickname as buyer_nickname,
                seller.nickname as seller_nickname
            FROM chat_room cr
            JOIN product p ON cr.product_id = p.product_id
            JOIN member buyer ON cr.buyer_id = buyer.member_id
            JOIN member seller ON p.member_id = seller.member_id
            WHERE cr.room_id = ? AND (cr.buyer_id = ? OR p.member_id = ?)
        `;

        const [rooms] = await pool.query(query, [memberId, memberId, memberId, chatRoomId, memberId, memberId]);
        return rooms.length > 0 ? rooms[0] : null;
    },

    // 메시지 전송
    async sendMessage(chatRoomId, senderId, content) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const now = new Date();

            // 메시지 저장
            const [result] = await connection.query(
                `INSERT INTO chat_message (room_id, sender_id, content, created_at, is_read)
                VALUES (?, ?, ?, ?, FALSE)`,
                [chatRoomId, senderId, content, now]
            );

            // 채팅방 updated_at 갱신
            await connection.query(
                'UPDATE chat_room SET updated_at = ? WHERE room_id = ?',
                [now, chatRoomId]
            );

            // 생성된 메시지 조회
            const [messages] = await connection.query(
                'SELECT * FROM chat_message WHERE msg_id = ?',
                [result.insertId]
            );

            await connection.commit();
            return messages[0];
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    // 채팅방의 메시지 목록 조회
    async getMessages(chatRoomId, memberId) {
        // 먼저 채팅방 접근 권한 확인
        const [rooms] = await pool.query(
            `SELECT cr.*, p.member_id as seller_id
            FROM chat_room cr
            JOIN product p ON cr.product_id = p.product_id
            WHERE cr.room_id = ? AND (cr.buyer_id = ? OR p.member_id = ?)`,
            [chatRoomId, memberId, memberId]
        );

        if (rooms.length === 0) {
            throw new Error('접근 권한이 없습니다.');
        }

        // 메시지 조회
        const query = `
            SELECT
                m.*,
                sender.nickname as sender_nickname,
                sender.img as sender_img
            FROM chat_message m
            JOIN member sender ON m.sender_id = sender.member_id
            WHERE m.room_id = ?
            ORDER BY m.created_at ASC
        `;

        const [messages] = await pool.query(query, [chatRoomId]);
        return messages;
    },

    // 메시지 읽음 처리
    async markMessagesAsRead(chatRoomId, memberId) {
        // 자신이 보낸 메시지가 아닌 읽지 않은 메시지를 읽음 처리
        const query = `
            UPDATE chat_message
            SET is_read = TRUE
            WHERE room_id = ? AND sender_id != ? AND is_read = FALSE
        `;

        const [result] = await pool.query(query, [chatRoomId, memberId]);
        return result.affectedRows;
    },

    // 채팅방 참여자인지 확인
    async isChatRoomMember(chatRoomId, memberId) {
        const [rooms] = await pool.query(
            `SELECT cr.*, p.member_id as seller_id
            FROM chat_room cr
            JOIN product p ON cr.product_id = p.product_id
            WHERE cr.room_id = ? AND (cr.buyer_id = ? OR p.member_id = ?)`,
            [chatRoomId, memberId, memberId]
        );

        return rooms.length > 0;
    },

    // 상품으로 채팅방 찾기 (구매자 기준)
    async findChatRoomByProduct(productId, buyerId) {
        const query = `
            SELECT cr.*
            FROM chat_room cr
            WHERE cr.product_id = ? AND cr.buyer_id = ?
        `;

        const [rooms] = await pool.query(query, [productId, buyerId]);
        return rooms.length > 0 ? rooms[0] : null;
    }
};

export default ChatModel;
