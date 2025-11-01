import { pool } from '../middleware/dbConnection.js';

const JobModel = {
    // 3DGS Job 생성
    async create3DGSJob(productId) {
        const now = new Date();

        const query = `
            INSERT INTO job_3dgs
            (product_id, status, created_at)
            VALUES (?, 'QUEUED', ?)
        `;

        await pool.query(query, [productId, now]);

        // 외부 API 호출하여 워커에게 Job 생성 알림
        await this.notifyWorker('3dgs', productId);

        return productId;
    },

    // 3DGS Job 생성 (트랜잭션 기반 - connection 전달받음)
    async create3DGSJobWithConnection(connection, productId) {
        const now = new Date();

        const query = `
            INSERT INTO job_3dgs
            (product_id, status, created_at)
            VALUES (?, 'QUEUED', ?)
        `;

        await connection.query(query, [productId, now]);

        return productId;
    },

    // AI 설명 생성 Job 생성
    async createDescriptionJob(productId) {
        const now = new Date();

        const query = `
            INSERT INTO fault_description
            (product_id, status, created_at)
            VALUES (?, 'QUEUED', ?)
        `;

        await pool.query(query, [productId, now]);

        // 외부 API 호출하여 워커에게 Job 생성 알림
        await this.notifyWorker('description', productId);

        return productId;
    },

    // AI 설명 생성 Job 생성 (트랜잭션 기반 - connection 전달받음)
    async createDescriptionJobWithConnection(connection, productId) {
        const now = new Date();

        const query = `
            INSERT INTO fault_description
            (product_id, status, created_at)
            VALUES (?, 'QUEUED', ?)
        `;

        await connection.query(query, [productId, now]);

        return productId;
    },

    // 외부 워커에게 Job 생성 알림
    async notifyWorker(jobType, productId) {
        try {
            const workerUrl = process.env.WORKER_API_URL;

            if (!workerUrl) {
                console.warn('WORKER_API_URL not configured, skipping worker notification');
                return;
            }

            const endpoint = jobType === '3dgs'
                ? `${workerUrl}/jobs/3dgs`
                : `${workerUrl}/jobs/description`;

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.WORKER_API_KEY || ''}`,
                },
                body: JSON.stringify({
                    productId,
                    jobType,
                    timestamp: new Date().toISOString(),
                }),
            });

            if (!response.ok) {
                console.error(`Failed to notify worker for ${jobType} job:`, response.statusText);
            } else {
                console.log(`Worker notified successfully for ${jobType} job: ${productId}`);
            }
        } catch (error) {
            console.error(`Error notifying worker for ${jobType} job:`, error.message);
            // 워커 알림 실패는 Job 생성을 실패시키지 않음
        }
    },

    // Product의 모든 Job 상태 조회
    async getAllJobsByProductId(productId) {
        const [job3dgs] = await pool.query(
            'SELECT * FROM job_3dgs WHERE product_id = ?',
            [productId]
        );
        const [jobDesc] = await pool.query(
            'SELECT * FROM fault_description WHERE product_id = ?',
            [productId]
        );

        return {
            job3dgs: job3dgs.length > 0 ? job3dgs[0] : null,
            description: jobDesc.length > 0 ? jobDesc[0] : null,
        };
    },

    // 3DGS Job 상태 업데이트
    async update3DGSJobStatus(productId, status, log = null, errorMsg = null) {
        const now = new Date();
        const fields = ['status = ?', 'updated_at = ?'];
        const values = [status, now];

        if (log !== null) {
            fields.push('log = ?');
            values.push(log);
        }

        if (errorMsg !== null) {
            fields.push('error_msg = ?');
            values.push(errorMsg);
        }

        if (status === 'DONE') {
            fields.push('completed_at = ?');
            values.push(now);
        }

        values.push(productId);

        const query = `UPDATE job_3dgs SET ${fields.join(', ')} WHERE product_id = ?`;
        const [result] = await pool.query(query, values);

        return result.affectedRows > 0;
    },

    // AI 설명 Job 상태 업데이트
    async updateDescriptionJobStatus(productId, status, markdown = null, errorMsg = null) {
        const now = new Date();
        const fields = ['status = ?', 'updated_at = ?'];
        const values = [status, now];

        if (markdown !== null) {
            fields.push('markdown = ?');
            values.push(markdown);
        }

        if (errorMsg !== null) {
            fields.push('error_msg = ?');
            values.push(errorMsg);
        }

        if (status === 'DONE') {
            fields.push('completed_at = ?');
            values.push(now);
        }

        values.push(productId);

        const query = `UPDATE fault_description SET ${fields.join(', ')} WHERE product_id = ?`;
        const [result] = await pool.query(query, values);

        return result.affectedRows > 0;
    },
};

export default JobModel;
