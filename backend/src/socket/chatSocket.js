import ChatModel from '../models/chatModel.js';
import jwt from 'jsonwebtoken';

/**
 * Socket.IO 인증 미들웨어
 */
export const authenticateSocket = (socket, next) => {
    try {
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error('인증 토큰이 필요합니다.'));
        }

        // JWT 토큰 검증
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.userId;
        socket.user = decoded;

        next();
    } catch (error) {
        console.error('Socket 인증 오류:', error);
        next(new Error('인증에 실패했습니다.'));
    }
};

/**
 * 채팅 Socket.IO 이벤트 핸들러
 */
export const setupChatSocket = (io) => {
    // 인증 미들웨어 적용
    io.use(authenticateSocket);

    io.on('connection', (socket) => {
        console.log(`사용자 연결됨: ${socket.userId}`);

        // 채팅방 입장
        socket.on('join-room', async (chatRoomId) => {
            try {
                // 채팅방 접근 권한 확인
                const isMember = await ChatModel.isChatRoomMember(chatRoomId, socket.userId);

                if (!isMember) {
                    socket.emit('error', { message: '채팅방 접근 권한이 없습니다.' });
                    return;
                }

                // Socket.IO 룸에 참여
                socket.join(`room:${chatRoomId}`);
                console.log(`사용자 ${socket.userId}가 채팅방 ${chatRoomId}에 입장`);

                // 입장 성공 알림
                socket.emit('joined-room', { chatRoomId });

                // 해당 채팅방의 다른 사용자에게 입장 알림
                socket.to(`room:${chatRoomId}`).emit('user-joined', {
                    userId: socket.userId,
                    chatRoomId
                });
            } catch (error) {
                console.error('채팅방 입장 오류:', error);
                socket.emit('error', { message: '채팅방 입장 중 오류가 발생했습니다.' });
            }
        });

        // 채팅방 퇴장
        socket.on('leave-room', (chatRoomId) => {
            socket.leave(`room:${chatRoomId}`);
            console.log(`사용자 ${socket.userId}가 채팅방 ${chatRoomId}에서 퇴장`);

            // 해당 채팅방의 다른 사용자에게 퇴장 알림
            socket.to(`room:${chatRoomId}`).emit('user-left', {
                userId: socket.userId,
                chatRoomId
            });
        });

        // 메시지 전송
        socket.on('send-message', async ({ chatRoomId, content }) => {
            try {
                // 채팅방 접근 권한 확인
                const isMember = await ChatModel.isChatRoomMember(chatRoomId, socket.userId);

                if (!isMember) {
                    socket.emit('error', { message: '채팅방 접근 권한이 없습니다.' });
                    return;
                }

                if (!content || content.trim() === '') {
                    socket.emit('error', { message: '메시지 내용이 필요합니다.' });
                    return;
                }

                // 데이터베이스에 메시지 저장
                const message = await ChatModel.sendMessage(chatRoomId, socket.userId, content.trim());

                // 메시지에 발신자 정보 추가
                const messageWithSender = {
                    ...message,
                    sender_id: socket.userId,
                };

                // 채팅방의 모든 사용자에게 메시지 브로드캐스트 (자신 포함)
                io.to(`room:${chatRoomId}`).emit('new-message', messageWithSender);

                console.log(`메시지 전송: 사용자 ${socket.userId} -> 채팅방 ${chatRoomId}`);
            } catch (error) {
                console.error('메시지 전송 오류:', error);
                socket.emit('error', { message: '메시지 전송 중 오류가 발생했습니다.' });
            }
        });

        // 메시지 읽음 처리
        socket.on('mark-as-read', async ({ chatRoomId }) => {
            try {
                // 채팅방 접근 권한 확인
                const isMember = await ChatModel.isChatRoomMember(chatRoomId, socket.userId);

                if (!isMember) {
                    socket.emit('error', { message: '채팅방 접근 권한이 없습니다.' });
                    return;
                }

                // 읽음 처리
                const count = await ChatModel.markMessagesAsRead(chatRoomId, socket.userId);

                // 채팅방의 다른 사용자에게 읽음 알림
                socket.to(`room:${chatRoomId}`).emit('messages-read', {
                    userId: socket.userId,
                    chatRoomId,
                    count
                });

                console.log(`읽음 처리: 사용자 ${socket.userId}, 채팅방 ${chatRoomId}, ${count}개 메시지`);
            } catch (error) {
                console.error('읽음 처리 오류:', error);
                socket.emit('error', { message: '읽음 처리 중 오류가 발생했습니다.' });
            }
        });

        // 타이핑 상태 전송
        socket.on('typing', ({ chatRoomId, isTyping }) => {
            socket.to(`room:${chatRoomId}`).emit('user-typing', {
                userId: socket.userId,
                chatRoomId,
                isTyping
            });
        });

        // 연결 해제
        socket.on('disconnect', () => {
            console.log(`사용자 연결 해제됨: ${socket.userId}`);
        });

        // 에러 처리
        socket.on('error', (error) => {
            console.error('Socket 오류:', error);
        });
    });

    return io;
};
