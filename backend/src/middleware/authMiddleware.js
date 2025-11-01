import { verifyToken } from '../utils/jwtUtil.js';
import logger from '../utils/logger.js';

/**
 * JWT 토큰 검증 미들웨어
 * Authorization 헤더에서 Bearer 토큰을 추출하고 검증합니다.
 */
export const authenticateToken = (req, res, next) => {
    const requestId = `${req.method} ${req.originalUrl || req.url}`;
    logger.debug(`[AuthMiddleware] 인증 시작 - ${requestId}`);

    try {
        // Authorization 헤더에서 토큰 추출
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (authHeader) {
            logger.debug(`[AuthMiddleware] Authorization 헤더 존재`, { requestId, tokenLength: token?.length || 0 });
        }

        if (!token) {
            logger.warn(`[AuthMiddleware] 인증 실패 - 토큰 없음`, { requestId });
            return res.status(401).json({
                success: false,
                message: '인증 토큰이 필요합니다.',
            });
        }

        // 토큰 검증
        try {
            const decoded = verifyToken(token);
            req.user = decoded; // 요청 객체에 사용자 정보 추가
            logger.debug(`[AuthMiddleware] 인증 성공`, { requestId, memberId: decoded.memberId, email: decoded.email });
            next();
        } catch (error) {
            logger.warn(`[AuthMiddleware] 토큰 검증 실패`, { requestId, error: error.message });
            return res.status(403).json({
                success: false,
                message: error.message || '유효하지 않은 토큰입니다.',
            });
        }
    } catch (error) {
        logger.error(`[AuthMiddleware] 인증 미들웨어 에러`, error, { requestId });
        return res.status(500).json({
            success: false,
            message: '인증 처리 중 오류가 발생했습니다.',
        });
    }
};

/**
 * 선택적 JWT 토큰 검증 미들웨어
 * 토큰이 있으면 검증하고, 없어도 계속 진행합니다.
 */
export const optionalAuthenticateToken = (req, res, next) => {
    const requestId = `${req.method} ${req.originalUrl || req.url}`;
    logger.debug(`[OptionalAuth] 선택적 인증 시작`, { requestId });

    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            logger.debug(`[OptionalAuth] 토큰 존재 - 검증 시도`, { requestId });
            try {
                const decoded = verifyToken(token);
                req.user = decoded;
                logger.debug(`[OptionalAuth] 토큰 검증 성공`, { requestId, memberId: decoded.memberId });
            } catch (error) {
                // 토큰이 유효하지 않아도 계속 진행
                logger.debug(`[OptionalAuth] 토큰 검증 실패 (계속 진행)`, { requestId, error: error.message });
                req.user = null;
            }
        } else {
            logger.debug(`[OptionalAuth] 토큰 없음 (계속 진행)`, { requestId });
        }

        next();
    } catch (error) {
        logger.error(`[OptionalAuth] 선택적 인증 미들웨어 에러`, error, { requestId });
        next();
    }
};
