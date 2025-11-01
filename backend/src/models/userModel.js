import { pool } from '../middleware/dbConnection.js';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

const UserModel = {
    // 회원가입
    async createUser({ email, password, nickname, img = null }) {
        try {
            const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
            const createdAt = new Date();

            const [result] = await pool.query(
                'INSERT INTO member (email, password, nickname, img, created_at) VALUES (?, ?, ?, ?, ?)',
                [email, hashedPassword, nickname, img, createdAt]
            );

            return {
                member_id: result.insertId,
                email,
                nickname,
                img,
                created_at: createdAt
            };
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                if (error.message.includes('email')) {
                    throw new Error('이미 사용 중인 이메일입니다.');
                } else if (error.message.includes('nickname')) {
                    throw new Error('이미 사용 중인 닉네임입니다.');
                }
            }
            throw error;
        }
    },

    // 이메일로 사용자 조회
    async findByEmail(email) {
        try {
            const [rows] = await pool.query(
                'SELECT * FROM member WHERE email = ?',
                [email]
            );
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            throw error;
        }
    },

    // ID로 사용자 조회
    async findById(memberId) {
        try {
            const [rows] = await pool.query(
                'SELECT member_id, email, nickname, img, created_at, updated_at FROM member WHERE member_id = ?',
                [memberId]
            );
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            throw error;
        }
    },

    // 비밀번호 검증
    async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    },

    // 사용자 정보 업데이트
    async updateUser(memberId, updates) {
        try {
            const allowedUpdates = ['nickname', 'img', 'password'];
            const updateFields = [];
            const values = [];

            for (const [key, value] of Object.entries(updates)) {
                if (allowedUpdates.includes(key) && value !== undefined) {
                    if (key === 'password') {
                        updateFields.push('password = ?');
                        values.push(await bcrypt.hash(value, SALT_ROUNDS));
                    } else {
                        updateFields.push(`${key} = ?`);
                        values.push(value);
                    }
                }
            }

            if (updateFields.length === 0) {
                return false;
            }

            updateFields.push('updated_at = ?');
            values.push(new Date());
            values.push(memberId);

            const [result] = await pool.query(
                `UPDATE member SET ${updateFields.join(', ')} WHERE member_id = ?`,
                values
            );

            return result.affectedRows > 0;
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('이미 사용 중인 닉네임입니다.');
            }
            throw error;
        }
    },

    // 사용자 삭제
    async deleteUser(memberId) {
        try {
            const [result] = await pool.query(
                'DELETE FROM member WHERE member_id = ?',
                [memberId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    },
};

export default UserModel;
