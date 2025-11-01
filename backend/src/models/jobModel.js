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
    async create3DGSJobWithConnection(connection, productId, s3Keys) {
        const now = new Date();

        const query = `
            INSERT INTO job_3dgs
            (product_id, status, created_at)
            VALUES (?, 'QUEUED', ?)
        `;

        await connection.query(query, [productId, now]);

        // 외부 API 호출
        await this.notify3DGSWorker(productId, s3Keys);

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
    async createDescriptionJobWithConnection(connection, productId, productName, s3Keys) {
        const now = new Date();

        const query = `
            INSERT INTO fault_description
            (product_id, status, created_at)
            VALUES (?, 'QUEUED', ?)
        `;

        await connection.query(query, [productId, now]);

        // 외부 API 호출
        await this.notifyDescriptionWorker(productId, productName, s3Keys);

        return productId;
    },

    // Description 워커에게 알림 (JSON 요청)
    async notifyDescriptionWorker(productId, productName, s3Keys) {
        try {
            const descriptionUrl = process.env.DESCRIPTION_API_URL || 'http://kaprpc.iptime.org:5052';
            const endpoint = `${descriptionUrl}/inspect/fault_desc`;

            // S3 키를 S3 URI 형식으로 변환
            const bucketName = process.env.AWS_BUCKET_NAME;
            const s3Images = s3Keys.map(key => `s3://${bucketName}/${key}`);

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'accept': 'application/json',
                },
                body: JSON.stringify({
                    product_id: productId,
                    product_name: productName,
                    s3_images: s3Images,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`[Job] Description API 호출 실패 - productId: ${productId}, status: ${response.status}, error: ${errorText}`);
                throw new Error(`Description API failed: ${response.status}`);
            }

            console.log(`[Job] Description API 호출 성공 - productId: ${productId}`);
            return await response.json();
        } catch (error) {
            console.error(`[Job] Description API 호출 에러 - productId: ${productId}:`, error);
            throw error;
        }
    },

    // 3DGS 워커에게 알림 (JSON 요청)
    async notify3DGSWorker(productId, s3Keys) {
        try {
            const reconUrl = process.env.RECON_API_URL || 'http://kaprpc.iptime.org:5051';
            const endpoint = `${reconUrl}/recon/jobs`;

            // S3 키를 S3 URL 문자열로 변환
            const bucketName = process.env.AWS_BUCKET_NAME;
            const files = s3Keys.map(key => `s3://${bucketName}/${key}`);

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'accept': 'application/json',
                },
                body: JSON.stringify({
                    files: files,
                    original_resolution: false,
                    iterations: 0,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`[Job] 3DGS API 호출 실패 - productId: ${productId}, status: ${response.status}, error: ${errorText}`);
                throw new Error(`3DGS API failed: ${response.status}`);
            }

            console.log(`[Job] 3DGS API 호출 성공 - productId: ${productId}`);
            return await response.json();
        } catch (error) {
            console.error(`[Job] 3DGS API 호출 에러 - productId: ${productId}:`, error);
            throw error;
        }
    },

    // 외부 워커에게 Job 생성 알림 (레거시 메서드, 호환성 유지)
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
