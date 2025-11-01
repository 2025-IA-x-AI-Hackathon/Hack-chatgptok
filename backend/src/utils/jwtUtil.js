import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key-change-this';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

/**
 * JWT 액세스 토큰 생성
 * @param {Object} payload - 토큰에 담을 정보 (userId, email 등)
 * @returns {string} JWT 토큰
 */
export const generateAccessToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
    });
};

/**
 * JWT 리프레시 토큰 생성
 * @param {Object} payload - 토큰에 담을 정보 (userId)
 * @returns {string} JWT 리프레시 토큰
 */
export const generateRefreshToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_REFRESH_EXPIRES_IN,
    });
};

/**
 * JWT 토큰 검증
 * @param {string} token - 검증할 토큰
 * @returns {Object} 디코딩된 토큰 정보
 * @throws {Error} 토큰이 유효하지 않을 경우
 */
export const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new Error('토큰이 만료되었습니다.');
        } else if (error.name === 'JsonWebTokenError') {
            throw new Error('유효하지 않은 토큰입니다.');
        }
        throw error;
    }
};

/**
 * 토큰에서 사용자 정보 추출 (검증 없이)
 * @param {string} token - 디코딩할 토큰
 * @returns {Object} 디코딩된 토큰 정보
 */
export const decodeToken = (token) => {
    return jwt.decode(token);
};
