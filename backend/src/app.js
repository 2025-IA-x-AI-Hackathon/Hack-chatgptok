import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import routes from './routes/route.js';
import rateLimitMiddleware from './middleware/rateLimitMiddleware.js';
import timeoutMiddleware from './middleware/timeoutMiddleware.js';
import {
    helmetMiddleware,
    cspMiddleware,
} from './middleware/securityMiddleware.js';
import dbConnectionMiddleware from './middleware/dbConnection.js';
import sessionConfig from './config/session.js';
import { setupChatSocket } from './socket/chatSocket.js';

const app = express();
const httpServer = createServer(app);

// Socket.IO 서버 생성 및 CORS 설정
const io = new Server(httpServer, {
    cors: {
        origin: 'http://localhost:3000',
        credentials: true,
        methods: ['GET', 'POST']
    }
});

// Socket.IO 채팅 설정
setupChatSocket(io);

app.use(
    cors({
        origin: 'http://localhost:3000',
        credentials: true, // 쿠키 전송을 위해 필요
    }),
);

// 미들웨어 적용
app.use(helmetMiddleware);
app.use(cspMiddleware);
app.use(rateLimitMiddleware);
app.use(
    '/public',
    express.static('public', {
        setHeaders: (res, path, stat) => {
            res.set('Cross-Origin-Resource-Policy', 'cross-origin');
            // 캐시 설정 (선택사항)
            //res.set('Cache-Control', 'public, max-age=31557600');
        },
    }),
);
app.use(timeoutMiddleware);
app.use(dbConnectionMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session(sessionConfig));

// 라우터 적용
app.use('/api/v1', routes);

// HTTP 서버 시작 (Socket.IO 포함)
const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`🔌 WebSocket server is ready`);
});

export default app;
