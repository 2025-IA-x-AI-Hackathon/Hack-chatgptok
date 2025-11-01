import express from 'express';
import cors from 'cors';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import routes from './routes/route.js';
import rateLimitMiddleware from './middleware/rateLimitMiddleware.js';
import timeoutMiddleware from './middleware/timeoutMiddleware.js';
import {
    helmetMiddleware,
    cspMiddleware,
} from './middleware/securityMiddleware.js';
import dbConnectionMiddleware from './middleware/dbConnection.js';
import sessionConfig from './config/session.js';
import swaggerSpecs from './config/swagger.js';

const app = express();

app.use(
    cors({
        origin: true,
        credentials: true, // 쿠키 전송을 위해 필요
    }),
);

// 미들웨어 적용
app.use(helmetMiddleware);
// Swagger UI 경로에서는 CSP 비활성화 (해커톤용)
app.use((req, res, next) => {
    if (req.path.startsWith('/docs')) {
        return next();
    }
    cspMiddleware(req, res, next);
});
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

// Swagger UI
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// 라우터 적용
app.use('/api/v1', routes);

app.set('port', process.env.PORT);
app.listen(app.get('port'), () => {});

export default app;
