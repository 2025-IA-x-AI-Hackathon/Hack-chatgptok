import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    connectionLimit: 10,
    timezone: '+09:00', // 한국 시간(KST) 설정
});

/**
 * 쿼리 로깅 함수 (실행 시간 포함)
 * @param {string} query - 실행된 SQL 쿼리
 * @param {Array} params - 쿼리에 사용된 파라미터
 * @param {Object|Array} result - 쿼리 결과
 * @param {bigint} startTime - 쿼리 시작 시간 (process.hrtime.bigint())
 */
const logQuery = (query, params, result, startTime = null) => {
    const duration = startTime !== null 
        ? Number((Number(process.hrtime.bigint() - startTime) / 1000000).toFixed(2))
        : null;
    logger.query(query, params, result, duration);
};

// 기존 pool.query를 저장
const originalPoolQuery = pool.query.bind(pool);

/**
 * pool.query를 래핑하여 로깅 기능 추가
 * @param {string} query - 실행할 SQL 쿼리
 * @param {Array} [params] - 쿼리에 사용될 파라미터
 * @returns {Promise<Array>} - 쿼리 결과
 */
pool.query = async (query, params) => {
    const startTime = process.hrtime.bigint();
    try {
        const [rows] = await originalPoolQuery(query, params);
        logQuery(query, params, rows, startTime);
        return [rows];
    } catch (error) {
        logger.queryError(query, params, error);
        throw error;
    }
};

const dbConnectionMiddleware = async (req, res, next) => {
    try {
        const connection = await pool.getConnection();

        // 한국 시간(KST)으로 타임존 설정
        await connection.query("SET time_zone = '+09:00'");

        const originalQuery = connection.query.bind(connection);
        connection.query = async (...args) => {
            const startTime = process.hrtime.bigint();
            try {
                const [rows] = await originalQuery(...args);
                logQuery(args[0], args[1], rows, startTime);
                return [rows];
            } catch (error) {
                logger.queryError(args[0], args[1], error);
                throw error;
            }
        };

        req.db = connection;

        res.on('finish', () => {
            if (req.db) req.db.release();
        });

        next();
    } catch (error) {
        logger.error('Database connection failed', error, {
            path: req.path,
            method: req.method,
        });
        res.status(500).json({ error: 'Database connection failed' });
    }
};

export default dbConnectionMiddleware;
export { pool };
