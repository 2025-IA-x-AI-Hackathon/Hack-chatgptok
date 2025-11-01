import { verifyToken } from '../utils/jwtUtil.js';

/**
 * JWT 토큰 검증 미들웨어
 * Authorization 헤더에서 Bearer 토큰을 추출하고 검증합니다.
 */
export const authenticateToken = (req, res, next) => {
    try {
        // Authorization 헤더에서 토큰 추출
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                success: false,
                message: '인증 토큰이 필요합니다.',
            });
        }

        // 토큰 검증
        try {
            const decoded = verifyToken(token);
            req.user = decoded; // 요청 객체에 사용자 정보 추가
            next();
        } catch (error) {
            return res.status(403).json({
                success: false,
                message: error.message || '유효하지 않은 토큰입니다.',
            });
        }
    } catch (error) {
        console.error('인증 미들웨어 에러:', error);
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
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            try {
                const decoded = verifyToken(token);
                req.user = decoded;
            } catch (error) {
                // 토큰이 유효하지 않아도 계속 진행
                req.user = null;
            }
        }

        next();
    } catch (error) {
        console.error('선택적 인증 미들웨어 에러:', error);
        next();
    }
};
