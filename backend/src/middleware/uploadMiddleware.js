import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import multer from 'multer';
import multerS3 from 'multer-s3';
import path from 'path';

// AWS S3 설정
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

// 프로필 이미지용 S3 저장소 설정
const profileStorage = multerS3({
    s3,
    bucket: process.env.AWS_BUCKET_NAME,
    key(req, file, cb) {
        cb(
            null,
            `profiles/${Date.now().toString()}${path.extname(file.originalname)}`,
        );
    },
});

// 게시글 이미지용 S3 저장소 설정
const postStorage = multerS3({
    s3,
    bucket: process.env.AWS_BUCKET_NAME,
    acl: 'public-read',
    key(req, file, cb) {
        cb(
            null,
            `posts/${Date.now().toString()}${path.extname(file.originalname)}`,
        );
    },
});

// 파일 필터링 (이미지 파일만 허용)
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml',
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('지원하지 않는 파일 형식입니다.'), false);
    }
};

// 프로필 이미지 업로드 설정
const uploadProfile = multer({
    storage: profileStorage,
    fileFilter,
    limits: {
        fileSize: 150 * 1024 * 1024,
        files: 1,
    },
}).single('img');

// 게시글 이미지 업로드 설정
const uploadPost = multer({
    storage: postStorage,
    fileFilter,
    limits: {
        fileSize: 150 * 1024 * 1024,
        files: 1,
    },
}).single('img');
export { uploadProfile, uploadPost };
