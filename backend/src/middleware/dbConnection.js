import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import colors from 'colors';
import moment from 'moment';

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    connectionLimit: 10,
});

/**
 * 쿼리 로깅 함수
 * @param {string} query - 실행된 SQL 쿼리
 * @param {Array} params - 쿼리에 사용된 파라미터
 * @param {Object|Array} result - 쿼리 결과
 */
const logQuery = (query, params, result) => {
    console.log(colors.gray('\n─────────────────────────────'));
    console.log(colors.yellow(`[${moment().format('YYYY-MM-DD HH:mm:ss')}]`));

    console.log(colors.cyan('Query:'), query);
    if (params) {
        console.log(colors.green('Params:'), params);
    }

    console.log(colors.magenta('Result:'), JSON.stringify(result, null, 2));

    // 배열인 경우에만 행 수 표시
    if (Array.isArray(result)) {
        console.log(colors.gray(`Total rows: ${result.length}`));
    }

    console.log(colors.gray('─────────────────────────────\n'));
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
    try {
        const [rows] = await originalPoolQuery(query, params);
        logQuery(query, params, rows);
        return [rows];
    } catch (error) {
        console.error(colors.red('Query Error:'), error);
        throw error;
    }
};

const dbConnectionMiddleware = async (req, res, next) => {
    try {
        const connection = await pool.getConnection();

        const originalQuery = connection.query.bind(connection);
        connection.query = async (...args) => {
            const [rows] = await originalQuery(...args);
            logQuery(args[0], args[1], rows);
            return [rows];
        };

        req.db = connection;

        res.on('finish', () => {
            if (req.db) req.db.release();
        });

        next();
    } catch (error) {
        console.error(colors.red('DB Error:'), error);
        res.status(500).json({ error: 'Database connection failed' });
    }
};

export default dbConnectionMiddleware;
export { pool };
