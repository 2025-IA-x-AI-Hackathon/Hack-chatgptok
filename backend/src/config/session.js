import session from 'express-session';
import MySQLStoreFactory from 'express-mysql-session';
import { pool } from '../middleware/dbConnection.js';

// express-session과 함께 MySQLStore 생성
const MySQLStore = MySQLStoreFactory(session);

// MySQL 세션 스토어 옵션
const options = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    createDatabaseTable: true, // 테이블이 없으면 자동 생성
    schema: {
        tableName: 'sessions',
        columnNames: {
            session_id: 'session_id',
            expires: 'expires',
            data: 'data',
        },
    },
};

// MySQL 세션 스토어 생성
const sessionStore = new MySQLStore(options);

const sessionConfig = {
    store: sessionStore,
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    name: 'sessionId',
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: 'lax',
    },
};

export default sessionConfig;
