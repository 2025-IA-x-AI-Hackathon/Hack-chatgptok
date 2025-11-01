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
            const { filename, contentType } = req.query;

            if (!filename || !contentType) {
                console.log('[Upload] filename 또는 contentType이 없습니다');
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
                console.log('[Upload] 지원하지 않는 파일 형식입니다');
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

            console.log('[Upload] 단일 파일 업로드 성공 - 파일명:', filename, '파일 URL:', fileUrl);

            const uploadResponse = {
                uploadUrl,
                fileUrl,
                key,
                expiresIn: 900,
            };
            res.status(200).json({
                success: true,
                message: '단일 파일 업로드 성공',
                data: uploadResponse,
            });
        } catch (error) {
            console.error('[Upload] 단일 파일 업로드 오류:', error);
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    },

    // Pre-signed URL 일괄 생성 (여러 파일)
    async getMultiplePresignedUrls(req, res) {
        try {
            const { files } = req.body; // [{ filename, contentType }]

            if (!files || !Array.isArray(files) || files.length === 0) {
                console.log('[Upload] files 배열이 없습니다');
                return res
                    .status(400)
                    .json({
                        success: false,
                        message: 'files 배열이 필요합니다',
                    });
            }

            if (files.length > 50) {
                console.log('[Upload] 최대 50개의 파일만 허용됩니다');
                return res
                    .status(400)
                    .json({
                        success: false,
                        message: '최대 50개의 파일만 허용됩니다',
                    });
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
                        console.log('[Upload] 각 파일에는 filename과 contentType이 필요합니다');
                        return res.status(400).json({
                            success: false,
                            message: '각 파일에는 filename과 contentType이 필요합니다',
                        });
                    }

                    if (!allowedTypes.includes(contentType)) {
                        console.log('[Upload] 지원하지 않는 파일 형식입니다');
                        return res.status(400).json({
                            success: false,
                            message: `지원하지 않는 파일 형식입니다: ${contentType}`,
                        });
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

            const uploadResponse = {
                uploads: uploadData,
                expiresIn: 900,
            };

            console.log('[Upload] 여러 파일 업로드 성공 - 파일명:', files.map((file) => file.filename), '파일 URL:', uploadData.map((file) => file.fileUrl));

            res.status(200).json({
                success: true,
                message: '여러 파일 업로드 성공',
                data: uploadResponse,
            });
        } catch (error) {
            console.error('[Upload] 여러 파일 업로드 오류:', error);
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    },
};

export default UploadController;
