import ChatModel from '../models/chatModel.js';
import ProductModel from '../models/productModel.js';

const chatController = {
    // 채팅방 생성 또는 조회
    async createOrGetChatRoom(req, res) {
        try {
            const { productId } = req.body;
            const buyerId = req.user.memberId;

            if (!productId) {
                return res.status(400).json({
                    success: false,
                    message: '상품 ID가 필요합니다.'
                });
            }

            // 상품 정보 조회
            const product = await ProductModel.getProductById(productId);
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: '상품을 찾을 수 없습니다.'
                });
            }

            // 자기 자신의 상품인 경우
            if (buyerId === product.member_id) {
                return res.status(400).json({
                    success: false,
                    message: '자신의 상품에는 채팅할 수 없습니다.'
                });
            }

            // 채팅방 생성 또는 조회
            const chatRoom = await ChatModel.getOrCreateChatRoom(productId, buyerId);

            res.status(200).json({
                success: true,
                data: chatRoom
            });
        } catch (error) {
            console.error('채팅방 생성/조회 오류:', error);
            res.status(500).json({
                success: false,
                message: '서버 오류가 발생했습니다.'
            });
        }
    },

    // 사용자의 채팅방 목록 조회
    async getChatRooms(req, res) {
        try {
            const memberId = req.user.memberId;
            const chatRooms = await ChatModel.getChatRoomsByUser(memberId);

            res.status(200).json({
                success: true,
                data: chatRooms
            });
        } catch (error) {
            console.error('채팅방 목록 조회 오류:', error);
            res.status(500).json({
                success: false,
                message: '서버 오류가 발생했습니다.'
            });
        }
    },

    // 채팅방 상세 조회
    async getChatRoomDetail(req, res) {
        try {
            const { chatRoomId } = req.params;
            const memberId = req.user.memberId;

            const chatRoom = await ChatModel.getChatRoomById(chatRoomId, memberId);

            if (!chatRoom) {
                return res.status(404).json({
                    success: false,
                    message: '채팅방을 찾을 수 없거나 접근 권한이 없습니다.'
                });
            }

            res.status(200).json({
                success: true,
                data: chatRoom
            });
        } catch (error) {
            console.error('채팅방 상세 조회 오류:', error);
            res.status(500).json({
                success: false,
                message: '서버 오류가 발생했습니다.'
            });
        }
    },

    // 메시지 목록 조회
    async getMessages(req, res) {
        try {
            const { chatRoomId } = req.params;
            const memberId = req.user.memberId;

            // 채팅방 접근 권한 확인
            const isMember = await ChatModel.isChatRoomMember(chatRoomId, memberId);
            if (!isMember) {
                return res.status(403).json({
                    success: false,
                    message: '접근 권한이 없습니다.'
                });
            }

            const messages = await ChatModel.getMessages(chatRoomId, memberId);

            // 메시지를 읽음 처리
            await ChatModel.markMessagesAsRead(chatRoomId, memberId);

            res.status(200).json({
                success: true,
                data: messages
            });
        } catch (error) {
            console.error('메시지 목록 조회 오류:', error);
            res.status(500).json({
                success: false,
                message: '서버 오류가 발생했습니다.'
            });
        }
    },

    // 메시지 전송
    async sendMessage(req, res) {
        try {
            const { chatRoomId } = req.params;
            const { content } = req.body;
            const senderId = req.user.memberId;

            if (!content || content.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: '메시지 내용이 필요합니다.'
                });
            }

            // 채팅방 접근 권한 확인
            const isMember = await ChatModel.isChatRoomMember(chatRoomId, senderId);
            if (!isMember) {
                return res.status(403).json({
                    success: false,
                    message: '접근 권한이 없습니다.'
                });
            }

            const message = await ChatModel.sendMessage(chatRoomId, senderId, content);

            res.status(201).json({
                success: true,
                data: message
            });
        } catch (error) {
            console.error('메시지 전송 오류:', error);
            res.status(500).json({
                success: false,
                message: '서버 오류가 발생했습니다.'
            });
        }
    },

    // 메시지 읽음 처리
    async markAsRead(req, res) {
        try {
            const { chatRoomId } = req.params;
            const memberId = req.user.memberId;

            // 채팅방 접근 권한 확인
            const isMember = await ChatModel.isChatRoomMember(chatRoomId, memberId);
            if (!isMember) {
                return res.status(403).json({
                    success: false,
                    message: '접근 권한이 없습니다.'
                });
            }

            const count = await ChatModel.markMessagesAsRead(chatRoomId, memberId);

            res.status(200).json({
                success: true,
                data: { count }
            });
        } catch (error) {
            console.error('메시지 읽음 처리 오류:', error);
            res.status(500).json({
                success: false,
                message: '서버 오류가 발생했습니다.'
            });
        }
    }
};

export default chatController;
