import { io, Socket } from 'socket.io-client';
import type { ChatMessage } from './types';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:4000';

let socket: Socket | null = null;

/**
 * Socket.IO 연결 생성
 */
export const connectChatSocket = (token: string): Socket => {
  if (socket?.connected) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    auth: {
      token
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5
  });

  // 연결 성공
  socket.on('connect', () => {
    console.log('✅ WebSocket 연결 성공');
  });

  // 연결 실패
  socket.on('connect_error', (error) => {
    console.error('❌ WebSocket 연결 오류:', error.message);
  });

  // 연결 해제
  socket.on('disconnect', (reason) => {
    console.log('🔌 WebSocket 연결 해제:', reason);
  });

  // 에러
  socket.on('error', (error) => {
    console.error('⚠️ WebSocket 오류:', error);
  });

  return socket;
};

/**
 * Socket.IO 연결 해제
 */
export const disconnectChatSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('🔌 WebSocket 연결 종료');
  }
};

/**
 * 현재 Socket 인스턴스 가져오기
 */
export const getChatSocket = (): Socket | null => {
  return socket;
};

/**
 * 채팅방 입장
 */
export const joinChatRoom = (chatRoomId: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!socket?.connected) {
      reject(new Error('WebSocket이 연결되지 않았습니다.'));
      return;
    }

    socket.emit('join-room', chatRoomId);

    // 입장 성공 대기
    socket.once('joined-room', ({ chatRoomId: joinedRoomId }) => {
      console.log(`✅ 채팅방 ${joinedRoomId} 입장 성공`);
      resolve();
    });

    // 에러 처리
    socket.once('error', (error) => {
      console.error('❌ 채팅방 입장 실패:', error);
      reject(error);
    });

    // 타임아웃 설정 (5초)
    setTimeout(() => {
      reject(new Error('채팅방 입장 시간 초과'));
    }, 5000);
  });
};

/**
 * 채팅방 퇴장
 */
export const leaveChatRoom = (chatRoomId: number) => {
  if (socket?.connected) {
    socket.emit('leave-room', chatRoomId);
    console.log(`🚪 채팅방 ${chatRoomId} 퇴장`);
  }
};

/**
 * 메시지 전송
 */
export const sendChatMessage = (chatRoomId: number, content: string) => {
  if (!socket?.connected) {
    throw new Error('WebSocket이 연결되지 않았습니다.');
  }

  socket.emit('send-message', { chatRoomId, content });
};

/**
 * 메시지 읽음 처리
 */
export const markMessagesAsRead = (chatRoomId: number) => {
  if (socket?.connected) {
    socket.emit('mark-as-read', { chatRoomId });
  }
};

/**
 * 타이핑 상태 전송
 */
export const sendTypingStatus = (chatRoomId: number, isTyping: boolean) => {
  if (socket?.connected) {
    socket.emit('typing', { chatRoomId, isTyping });
  }
};

/**
 * 새 메시지 수신 리스너
 */
export const onNewMessage = (callback: (message: ChatMessage) => void) => {
  if (socket) {
    socket.on('new-message', callback);
  }
};

/**
 * 메시지 읽음 알림 리스너
 */
export const onMessagesRead = (
  callback: (data: { userId: number; chatRoomId: number; count: number }) => void
) => {
  if (socket) {
    socket.on('messages-read', callback);
  }
};

/**
 * 사용자 입장 알림 리스너
 */
export const onUserJoined = (
  callback: (data: { userId: number; chatRoomId: number }) => void
) => {
  if (socket) {
    socket.on('user-joined', callback);
  }
};

/**
 * 사용자 퇴장 알림 리스너
 */
export const onUserLeft = (
  callback: (data: { userId: number; chatRoomId: number }) => void
) => {
  if (socket) {
    socket.on('user-left', callback);
  }
};

/**
 * 사용자 타이핑 상태 리스너
 */
export const onUserTyping = (
  callback: (data: { userId: number; chatRoomId: number; isTyping: boolean }) => void
) => {
  if (socket) {
    socket.on('user-typing', callback);
  }
};

/**
 * 모든 리스너 제거
 */
export const removeAllListeners = () => {
  if (socket) {
    socket.off('new-message');
    socket.off('messages-read');
    socket.off('user-joined');
    socket.off('user-left');
    socket.off('user-typing');
  }
};
