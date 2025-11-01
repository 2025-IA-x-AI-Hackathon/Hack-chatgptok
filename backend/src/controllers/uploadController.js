import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import path from 'path';
import crypto from 'crypto';

// S3 클라이언트 초기화
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const UploadController = {
    // Pre-signed URL 생성 (단일 파일)
    async getPresignedUrl(req, res) {
        try {
            const memberId = req.user?.memberId;
            if (!memberId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { filename, contentType } = req.query;

            if (!filename || !contentType) {
                return res
                    .status(400)
                    .json({ error: 'filename and contentType are required' });
            }

            // 이미지 파일만 허용
            const allowedTypes = [
                'image/jpeg',
                'image/jpg',
                'image/png',
                'image/gif',
                'image/webp',
                'image/svg+xml',
            ];

            if (!allowedTypes.includes(contentType)) {
                return res
                    .status(400)
                    .json({ error: 'Only image files are allowed' });
            }

            // 파일 확장자 추출
            const ext = path.extname(filename);
            // 고유한 파일명 생성
            const uniqueFilename = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
            const key = `products/${uniqueFilename}`;

            // Pre-signed URL 생성
            const command = new PutObjectCommand({
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: key,
                ContentType: contentType,
                ACL: 'public-read', // 공개 읽기 권한
            });

            const uploadUrl = await getSignedUrl(s3Client, command, {
                expiresIn: 900, // 15분
            });

            const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

            res.status(200).json({
                uploadUrl,
                fileUrl,
                key,
                expiresIn: 900,
            });
        } catch (error) {
            console.error('Get presigned URL error:', error);
            res.status(500).json({ error: error.message });
        }
    },

    // Pre-signed URL 일괄 생성 (여러 파일)
    async getMultiplePresignedUrls(req, res) {
        try {
            const memberId = req.user?.memberId;
            if (!memberId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { files } = req.body; // [{ filename, contentType }]

            if (!files || !Array.isArray(files) || files.length === 0) {
                return res
                    .status(400)
                    .json({ error: 'files array is required' });
            }

            if (files.length > 50) {
                return res
                    .status(400)
                    .json({ error: 'Maximum 50 files allowed at once' });
            }

            // 이미지 파일만 허용
            const allowedTypes = [
                'image/jpeg',
                'image/jpg',
                'image/png',
                'image/gif',
                'image/webp',
                'image/svg+xml',
            ];

            const uploadData = await Promise.all(
                files.map(async (file) => {
                    const { filename, contentType } = file;

                    if (!filename || !contentType) {
                        throw new Error(
                            'Each file must have filename and contentType',
                        );
                    }

                    if (!allowedTypes.includes(contentType)) {
                        throw new Error(
                            `Invalid file type: ${contentType}`,
                        );
                    }

                    // 파일 확장자 추출
                    const ext = path.extname(filename);
                    // 고유한 파일명 생성
                    const uniqueFilename = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
                    const key = `products/${uniqueFilename}`;

                    // Pre-signed URL 생성
                    const command = new PutObjectCommand({
                        Bucket: process.env.AWS_BUCKET_NAME,
                        Key: key,
                        ContentType: contentType,
                        ACL: 'public-read',
                    });

                    const uploadUrl = await getSignedUrl(
                        s3Client,
                        command,
                        {
                            expiresIn: 900,
                        },
                    );

                    const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

                    return {
                        originalFilename: filename,
                        uploadUrl,
                        fileUrl,
                        key,
                    };
                }),
            );

            res.status(200).json({
                uploads: uploadData,
                expiresIn: 900,
            });
        } catch (error) {
            console.error('Get multiple presigned URLs error:', error);
            res.status(500).json({ error: error.message });
        }
    },
};

export default UploadController;
