import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import s3Client, { S3_BUCKET_NAME } from '../config/s3.js';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';

// Multer 메모리 스토리지 설정 (S3에 직접 업로드하기 위해)
const storage = multer.memoryStorage();

// 파일 필터 - 이미지만 허용
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed'), false);
    }
};

// Multer 설정
export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    // limits: {
    //     fileSize: 5 * 1024 * 1024, // 5MB 제한
    // },
});

/**
 * 이미지 업로드 및 Pre-signed URL 생성
 */
const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded',
            });
        }

        // 파일명 생성 (UUID + 원본 확장자)
        const fileExtension = req.file.originalname.split('.').pop();
        const fileName = `${uuidv4()}.${fileExtension}`;
        const s3Key = `images/${fileName}`;

        // S3에 파일 업로드
        const uploadParams = {
            Bucket: S3_BUCKET_NAME,
            Key: s3Key,
            Body: req.file.buffer,
            ContentType: req.file.mimetype,
        };

        const command = new PutObjectCommand(uploadParams);
        await s3Client.send(command);

        // Pre-signed URL 생성 (7일 유효)
        const getObjectParams = {
            Bucket: S3_BUCKET_NAME,
            Key: s3Key,
        };

        const presignedUrl = await getSignedUrl(
            s3Client,
            new GetObjectCommand(getObjectParams),
            { expiresIn: 7 * 24 * 60 * 60 } // 7일
        );

        // 공개 URL (버킷이 public이면 이것도 작동)
        const publicUrl = `https://${S3_BUCKET_NAME}.s3.${process.env.AWS_REGION || 'ap-northeast-2'}.amazonaws.com/${s3Key}`;

        return res.status(200).json({
            success: true,
            message: 'Image uploaded successfully',
            data: {
                fileName: fileName,
                s3Key: s3Key,
                presignedUrl: presignedUrl,
                publicUrl: publicUrl,
            },
        });
    } catch (error) {
        console.error('Upload error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to upload image',
            error: error.message,
        });
    }
};

export default {
    uploadImage,
};
