import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dotenv from 'dotenv';

dotenv.config();

const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'ap-northeast-2',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

export const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME || 'ss-s3-project';

/**
 * S3 객체에 대한 presigned URL을 생성합니다.
 * @param {string} s3Key - S3 객체 키
 * @param {number} expiresIn - URL 유효 기간 (초), 기본값: 3600초 (1시간)
 * @returns {Promise<string>} presigned URL
 */
export async function getPresignedUrl(s3Key, expiresIn = 3600) {
    try {
        const command = new GetObjectCommand({
            Bucket: S3_BUCKET_NAME,
            Key: s3Key,
        });

        const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn });
        return presignedUrl;
    } catch (error) {
        console.error('Presigned URL 생성 실패:', error);
        throw error;
    }
}

export default s3Client;
