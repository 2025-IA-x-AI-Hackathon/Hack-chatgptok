import helmet from 'helmet';

// 해커톤용: 기본 보안 기능만 활성화
export const helmetMiddleware = helmet({
    contentSecurityPolicy: false, // CSP는 별도로 관리
    crossOriginEmbedderPolicy: false,
});

// 해커톤용: 완화된 CSP 설정
export const cspMiddleware = helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https:'],
        imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
        connectSrc: ["'self'", '*'], // 해커톤용: 모든 origin 허용
        fontSrc: ["'self'", 'data:', 'https:'],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'", 'https:'],
        frameSrc: ["'self'"],
    },
});
