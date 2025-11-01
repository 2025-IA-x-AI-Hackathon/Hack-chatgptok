import { pool } from '../middleware/dbConnection.js';
import crypto from 'crypto';

const ProductModel = {
    // 상품 목록 조회 (페이지네이션 포함)
    async getProductList({ page = 1, limit = 20, status = 'ACTIVE', search = '' }) {
        const offset = (page - 1) * limit;

        let query = `
            SELECT
                p.*,
                m.nickname as seller_nickname,
                m.img as seller_img,
                (SELECT s3_key FROM product_image WHERE product_id = p.product_id ORDER BY sort_order LIMIT 1) as thumbnail
            FROM product p
            JOIN member m ON p.member_id = m.member_id
            WHERE p.sell_status = ?
        `;

        const params = [status];

        if (search) {
            query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const [products] = await pool.query(query, params);

        // 전체 개수 조회
        let countQuery = 'SELECT COUNT(*) as total FROM product WHERE sell_status = ?';
        const countParams = [status];

        if (search) {
            countQuery += ' AND (name LIKE ? OR description LIKE ?)';
            countParams.push(`%${search}%`, `%${search}%`);
        }

        const [countResult] = await pool.query(countQuery, countParams);
        const total = countResult[0].total;

        return {
            products,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    },

    // 상품 상세 조회
    async getProductById(productId) {
        const query = `
            SELECT
                p.*,
                m.nickname as seller_nickname,
                m.email as seller_email,
                m.img as seller_img,
                m.created_at as seller_created_at
            FROM product p
            JOIN member m ON p.member_id = m.member_id
            WHERE p.product_id = ?
        `;

        const [products] = await pool.query(query, [productId]);

        if (products.length === 0) {
            return null;
        }

        const product = products[0];

        // 상품 이미지 목록 조회 (s3_key 포함)
        const [images] = await pool.query(
            'SELECT product_image_id, product_id, s3_key, sort_order, created_at FROM product_image WHERE product_id = ? ORDER BY sort_order',
            [productId]
        );

        product.images = images;

        return product;
    },

    // 상품 생성 (단순 생성 - 트랜잭션 없음)
    async createProduct({ memberId, name, price, description }) {
        const productId = crypto.randomUUID();
        const now = new Date();

        const query = `
            INSERT INTO product
            (product_id, member_id, name, price, description, sell_status, job_count, view_cnt, likes_cnt, created_at)
            VALUES (?, ?, ?, ?, ?, 'PROCESSING', 0, 0, 0, ?)
        `;

        await pool.query(query, [productId, memberId, name, price, description, now]);

        return productId;
    },

    // 상품 생성 (트랜잭션 기반 - connection 전달받음)
    async createProductWithConnection(connection, { memberId, name, price, description }) {
        const productId = crypto.randomUUID();
        const now = new Date();

        const query = `
            INSERT INTO product
            (product_id, member_id, name, price, description, sell_status, job_count, view_cnt, likes_cnt, created_at)
            VALUES (?, ?, ?, ?, ?, 'PROCESSING', 0, 0, 0, ?)
        `;

        await connection.query(query, [productId, memberId, name, price, description, now]);

        return productId;
    },

    // 상품 이미지 추가
    async addProductImages(productId, imageUrls) {
        if (!imageUrls || imageUrls.length === 0) {
            return;
        }

        const now = new Date();
        const values = imageUrls.map((url, index) => [
            productId,
            url,
            index,
            now,
        ]);

        const query = `
            INSERT INTO product_image (product_id, s3_key, sort_order, created_at)
            VALUES ?
        `;

        await pool.query(query, [values]);
    },

    // 상품 이미지 추가 (트랜잭션 기반 - connection 전달받음)
    async addProductImagesWithConnection(connection, productId, images) {
        if (!images || images.length === 0) {
            return;
        }

        const now = new Date();
        const values = images.map((key, index) => [
            productId,
            key,
            index,
            now,
        ]);

        const query = `
            INSERT INTO product_image (product_id, s3_key, sort_order, created_at)
            VALUES ?
        `;

        await connection.query(query, [values]);
    },

    // 상품 수정
    async updateProduct(productId, updates) {
        const allowedFields = ['name', 'price', 'description', 'sell_status', 'ply_url'];
        const fields = [];
        const values = [];

        for (const [key, value] of Object.entries(updates)) {
            if (allowedFields.includes(key) && value !== undefined) {
                fields.push(`${key} = ?`);
                values.push(value);
            }
        }

        if (fields.length === 0) {
            return false;
        }

        fields.push('updated_at = ?');
        values.push(new Date());
        values.push(productId);

        const query = `UPDATE product SET ${fields.join(', ')} WHERE product_id = ?`;

        const [result] = await pool.query(query, values);

        return result.affectedRows > 0;
    },

    // 상품 삭제 (소프트 삭제)
    async deleteProduct(productId, memberId) {
        const query = `
            UPDATE product
            SET sell_status = 'DELETED', updated_at = ?
            WHERE product_id = ? AND member_id = ? AND sell_status != 'SOLD'
        `;

        const [result] = await pool.query(query, [new Date(), productId, memberId]);

        return result.affectedRows > 0;
    },

    // 내 판매 내역 조회
    async getMyProducts(memberId, status = null) {
        let query = `
            SELECT
                p.*,
                (SELECT s3_key FROM product_image WHERE product_id = p.product_id ORDER BY sort_order LIMIT 1) as thumbnail
            FROM product p
            WHERE p.member_id = ?
        `;

        const params = [memberId];

        if (status) {
            query += ' AND p.sell_status = ?';
            params.push(status);
        } else {
            query += ' AND p.sell_status != \'DELETED\'';
        }

        query += ' ORDER BY p.created_at DESC';

        const [products] = await pool.query(query, params);

        return products;
    },

    // 상품 소유자 확인
    async isProductOwner(productId, memberId) {
        const query = 'SELECT member_id FROM product WHERE product_id = ?';
        const [products] = await pool.query(query, [productId]);

        if (products.length === 0) {
            return false;
        }

        return products[0].member_id === memberId;
    },

    // 조회수 증가
    async increaseViewCount(productId) {
        const query = 'UPDATE product SET view_cnt = view_cnt + 1 WHERE product_id = ?';
        const [result] = await pool.query(query, [productId]);

        return result.affectedRows > 0;
    },

    // 좋아요 추가 (중복 방지 포함)
    async addLike(productId, memberId) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // 이미 좋아요했는지 확인
            const [existing] = await connection.query(
                'SELECT * FROM product_like WHERE product_id = ? AND member_id = ?',
                [productId, memberId]
            );

            if (existing.length > 0) {
                await connection.rollback();
                return { success: false, reason: 'already_liked' };
            }

            // product_like 테이블에 추가
            const now = new Date();
            await connection.query(
                'INSERT INTO product_like (product_id, member_id, created_at) VALUES (?, ?, ?)',
                [productId, memberId, now]
            );

            // product 테이블의 likes_cnt 증가
            await connection.query(
                'UPDATE product SET likes_cnt = likes_cnt + 1 WHERE product_id = ?',
                [productId]
            );

            await connection.commit();
            return { success: true };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    // 좋아요 취소
    async removeLike(productId, memberId) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // 좋아요 존재 확인
            const [existing] = await connection.query(
                'SELECT * FROM product_like WHERE product_id = ? AND member_id = ?',
                [productId, memberId]
            );

            if (existing.length === 0) {
                await connection.rollback();
                return { success: false, reason: 'not_liked' };
            }

            // product_like 테이블에서 삭제
            await connection.query(
                'DELETE FROM product_like WHERE product_id = ? AND member_id = ?',
                [productId, memberId]
            );

            // product 테이블의 likes_cnt 감소
            await connection.query(
                'UPDATE product SET likes_cnt = likes_cnt - 1 WHERE product_id = ? AND likes_cnt > 0',
                [productId]
            );

            await connection.commit();
            return { success: true };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    // 좋아요 여부 확인
    async isLiked(productId, memberId) {
        const query = 'SELECT * FROM product_like WHERE product_id = ? AND member_id = ?';
        const [rows] = await pool.query(query, [productId, memberId]);

        return rows.length > 0;
    },

    // 좋아요 수 증가 (내부용 - 직접 호출 지양)
    async increaseLikeCount(productId) {
        const query = 'UPDATE product SET likes_cnt = likes_cnt + 1 WHERE product_id = ?';
        const [result] = await pool.query(query, [productId]);

        return result.affectedRows > 0;
    },

    // 좋아요 수 감소 (내부용 - 직접 호출 지양)
    async decreaseLikeCount(productId) {
        const query = 'UPDATE product SET likes_cnt = likes_cnt - 1 WHERE product_id = ? AND likes_cnt > 0';
        const [result] = await pool.query(query, [productId]);

        return result.affectedRows > 0;
    },

    // job_count 증가
    async increaseJobCount(productId) {
        const query = 'UPDATE product SET job_count = job_count + 1 WHERE product_id = ?';
        const [result] = await pool.query(query, [productId]);

        return result.affectedRows > 0;
    },
};

export default ProductModel;
