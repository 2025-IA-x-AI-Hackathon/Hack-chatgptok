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

// 상품 이미지용 S3 저장소 설정
const productStorage = multerS3({
    s3,
    bucket: process.env.AWS_BUCKET_NAME,
    acl: 'public-read',
    key(req, file, cb) {
        cb(
            null,
            `products/${Date.now().toString()}${path.extname(file.originalname)}`,
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

// 상품 이미지 업로드 설정 (여러 파일, 최대 50개)
const uploadProductImages = multer({
    storage: productStorage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 파일당 10MB
        files: 50, // 최대 50개 파일
    },
}).array('images', 50); // 'images' 필드명으로 최대 50개

export { uploadProductImages };
