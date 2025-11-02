import express from 'express';

import userController from '../controllers/userController.js';
import productController from '../controllers/productController.js';
import authController from '../controllers/authController.js';
import chatController from '../controllers/chatController.js';
import uploadController from '../controllers/uploadController.js';
import notificationController from '../controllers/notificationController.js';

// middleware
import { authenticateToken, optionalAuthenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/v1/health:
 *   get:
 *     summary: 서버 상태 확인
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: 서버 정상 작동
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Server is running
 */
router.get('/health', (req, res) => {
    res.json({ success: true, message: 'Server is running' });
});

// Auth routes (JWT 기반)
/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: 회원가입
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - nickname
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: password123
 *               nickname:
 *                 type: string
 *                 example: 홍길동
 *               img:
 *                 type: string
 *                 description: S3 Key (업로드 후 받은 key 값)
 *                 example: profiles/1234567890-abc.jpg
 *     responses:
 *       201:
 *         description: 회원가입 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 회원가입이 완료되었습니다.
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *       400:
 *         description: 유효성 검증 실패
 *       409:
 *         description: 이미 사용 중인 이메일
 */
router.post('/auth/register', authController.register);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: 로그인
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *     responses:
 *       200:
 *         description: 로그인 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 로그인에 성공했습니다.
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *       400:
 *         description: 이메일 또는 비밀번호 누락
 *       401:
 *         description: 이메일 또는 비밀번호가 올바르지 않음
 */
router.post('/auth/login', authController.login);

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: 로그아웃
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 로그아웃 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 로그아웃되었습니다.
 *       401:
 *         description: 인증 필요
 */
router.post('/auth/logout', authenticateToken, authController.logout);

/**
 * @swagger
 * /api/v1/auth/refresh:
 *   post:
 *     summary: 토큰 갱신
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: 토큰 갱신 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 토큰이 갱신되었습니다.
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *       400:
 *         description: 리프레시 토큰 누락
 *       401:
 *         description: 유효하지 않은 리프레시 토큰
 */
router.post('/auth/refresh', authController.refreshToken);

/**
 * @swagger
 * /api/v1/users/me:
 *   get:
 *     summary: 내 정보 조회
 *     description: 인증된 사용자 본인의 정보를 조회합니다.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 내 정보 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         member_id:
 *                           type: integer
 *                           example: 1
 *                         email:
 *                           type: string
 *                           example: user@example.com
 *                         nickname:
 *                           type: string
 *                           example: 홍길동
 *                         img_url:
 *                           type: string
 *                           nullable: true
 *                           description: 프로필 이미지 Presigned URL (1시간 유효)
 *                           example: https://bucket.s3.region.amazonaws.com/profiles/image.jpg?X-Amz-...
 *                         created_at:
 *                           type: string
 *                           format: date-time
 *                         updated_at:
 *                           type: string
 *                           format: date-time
 *       401:
 *         description: 인증 필요
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *       404:
 *         description: 내 정보를 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 내 정보를 찾을 수 없습니다.
 *       500:
 *         description: 서버 에러
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 내 정보 조회 중 오류가 발생했습니다.
 */
router.get('/users/me', authenticateToken, userController.getMe);

/**
 * @swagger
 * /api/v1/upload/presigned-url:
 *   get:
 *     summary: 단일 파일 업로드를 위한 Pre-signed URL 생성
 *     description: 이미지 파일을 S3에 업로드하기 위한 Pre-signed URL을 생성합니다. 지원 형식 - image/jpeg, image/jpg, image/png, image/gif, image/webp, image/svg+xml
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: 파일명
 *         example: photo.jpg
 *       - in: query
 *         name: contentType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [image/jpeg, image/jpg, image/png, image/gif, image/webp, image/svg+xml]
 *         description: 파일 MIME 타입 (이미지만 허용)
 *         example: image/jpeg
 *     responses:
 *       200:
 *         description: Pre-signed URL 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 단일 파일 업로드 성공
 *                 data:
 *                   type: object
 *                   properties:
 *                     uploadUrl:
 *                       type: string
 *                       description: S3 업로드용 임시 URL (15분 유효)
 *                     fileUrl:
 *                       type: string
 *                       description: 업로드 후 접근할 최종 URL
 *                     key:
 *                       type: string
 *                       description: S3 객체 키
 *                       example: products/1234567890-abc123def456.jpg
 *                     expiresIn:
 *                       type: integer
 *                       description: URL 유효 시간(초)
 *                       example: 900
 *       400:
 *         description: 잘못된 요청 (filename/contentType 누락 또는 지원하지 않는 파일 형식)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Only image files are allowed
 *       401:
 *         description: 인증 필요
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unauthorized
 *       500:
 *         description: 서버 에러
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 */
router.get('/upload/presigned-url', authenticateToken, uploadController.getPresignedUrl);

/**
 * @swagger
 * /api/v1/upload/presigned-urls:
 *   post:
 *     summary: 여러 파일 업로드를 위한 Pre-signed URL 일괄 생성
 *     description: 여러 이미지 파일을 S3에 업로드하기 위한 Pre-signed URL을 일괄 생성합니다. 최대 50개까지 가능하며, 이미지 파일만 허용됩니다.
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - files
 *             properties:
 *               files:
 *                 type: array
 *                 description: 업로드할 파일 정보 배열 (최대 50개)
 *                 maxItems: 50
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required:
 *                     - filename
 *                     - contentType
 *                   properties:
 *                     filename:
 *                       type: string
 *                       example: photo1.jpg
 *                     contentType:
 *                       type: string
 *                       enum: [image/jpeg, image/jpg, image/png, image/gif, image/webp, image/svg+xml]
 *                       example: image/jpeg
 *     responses:
 *       200:
 *         description: Pre-signed URL 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 여러 파일 업로드 성공
 *                 data:
 *                   type: object
 *                   properties:
 *                     uploads:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           originalFilename:
 *                             type: string
 *                             example: photo1.jpg
 *                           uploadUrl:
 *                             type: string
 *                             description: S3 업로드용 임시 URL (15분 유효)
 *                           fileUrl:
 *                             type: string
 *                             description: 업로드 후 접근할 최종 URL
 *                           key:
 *                             type: string
 *                             description: S3 객체 키
 *                             example: products/1234567890-abc123def456.jpg
 *                     expiresIn:
 *                       type: integer
 *                       description: URL 유효 시간(초)
 *                       example: 900
 *       400:
 *         description: 잘못된 요청 (files 배열 누락, 최대 개수 초과, 지원하지 않는 파일 형식)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 최대 50개의 파일만 허용됩니다
 *       401:
 *         description: 인증 필요
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 인증되지 않은 사용자
 *       500:
 *         description: 서버 에러
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 */
router.post('/upload/presigned-urls', uploadController.getMultiplePresignedUrls);

/**
 * @swagger
 * /api/v1/users/{userId}/profile:
 *   get:
 *     summary: 사용자 프로필 조회
 *     description: 특정 사용자의 프로필을 조회합니다. 인증 없이 누구나 조회할 수 있습니다.
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 조회할 사용자 ID
 *         example: 1
 *     responses:
 *       200:
 *         description: 사용자 프로필 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         member_id:
 *                           type: integer
 *                           example: 1
 *                         email:
 *                           type: string
 *                           example: user@example.com
 *                         nickname:
 *                           type: string
 *                           example: 홍길동
 *                         img_url:
 *                           type: string
 *                           nullable: true
 *                           description: 프로필 이미지 Presigned URL (1시간 유효)
 *                           example: https://bucket.s3.region.amazonaws.com/profiles/image.jpg?X-Amz-...
 *                         created_at:
 *                           type: string
 *                           format: date-time
 *                         updated_at:
 *                           type: string
 *                           format: date-time
 *       400:
 *         description: 잘못된 요청 (userId 파라미터 누락)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 사용자 ID가 필요합니다.
 *       404:
 *         description: 사용자를 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 사용자를 찾을 수 없습니다.
 *       500:
 *         description: 서버 에러
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 사용자 프로필 조회 중 오류가 발생했습니다.
 */
router.get('/users/:userId/profile', userController.getProfile);

/**
 * @swagger
 * /api/v1/users/profile:
 *   put:
 *     summary: 내 프로필 수정
 *     description: 인증된 사용자 본인의 프로필 정보를 수정합니다.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nickname:
 *                 type: string
 *                 example: 새로운닉네임
 *               password:
 *                 type: string
 *                 format: password
 *                 example: newPassword123
 *               img:
 *                 type: string
 *                 description: S3 Key (업로드 후 받은 key 값)
 *                 example: profiles/1234567890-abc.jpg
 *     responses:
 *       200:
 *         description: 프로필 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 프로필이 성공적으로 업데이트되었습니다.
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         member_id:
 *                           type: integer
 *                           example: 1
 *                         email:
 *                           type: string
 *                           example: user@example.com
 *                         nickname:
 *                           type: string
 *                           example: 새로운닉네임
 *                         img_url:
 *                           type: string
 *                           nullable: true
 *                           description: 프로필 이미지 Presigned URL (1시간 유효)
 *                           example: https://bucket.s3.region.amazonaws.com/profiles/image.jpg?X-Amz-...
 *                         created_at:
 *                           type: string
 *                           format: date-time
 *                         updated_at:
 *                           type: string
 *                           format: date-time
 *       400:
 *         description: 잘못된 요청 (업데이트할 정보 없음 또는 프로필 업데이트 실패)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 업데이트할 정보가 없습니다.
 *       401:
 *         description: 인증 필요
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *       500:
 *         description: 서버 에러
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 프로필 수정 중 오류가 발생했습니다.
 */
router.put('/users/profile', authenticateToken, userController.updateProfile);

/**
 * @swagger
 * /api/v1/products:
 *   get:
 *     summary: 상품 목록 조회
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 페이지 번호
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: 페이지당 항목 수
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, ACTIVE, DELETED, SOLD, PROCESSING]
 *           default: ACTIVE
 *         description: 상품 상태 필터
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 검색 키워드 (상품명, 설명)
 *     responses:
 *       200:
 *         description: 상품 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 상품 목록 조회에 성공했습니다.
 *                 data:
 *                   type: object
 *                   properties:
 *                     products:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ProductListItem'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       500:
 *         description: 서버 에러
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 상품 목록 조회 중 오류가 발생했습니다.
 */
router.get('/products', productController.getProductList);

/**
 * @swagger
 * /api/v1/products/{productId}:
 *   get:
 *     summary: 상품 상세 조회
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: 상품 ID (UUID)
 *         example: 550e8400-e29b-41d4-a716-446655440000
 *     responses:
 *       200:
 *         description: 상품 조회 성공 (조회수 자동 증가)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 상품 조회에 성공했습니다.
 *                 data:
 *                   type: object
 *                   properties:
 *                     product:
 *                       $ref: '#/components/schemas/Product'
 *       400:
 *         description: 잘못된 요청 (productId 누락)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 상품 ID가 필요합니다.
 *       404:
 *         description: 상품을 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 상품을 찾을 수 없습니다.
 *       500:
 *         description: 서버 에러
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 상품 조회 중 오류가 발생했습니다.
 */
router.get('/products/:productId', optionalAuthenticateToken, productController.getProductById);

/**
 * @swagger
 * /api/v1/products:
 *   post:
 *     summary: 상품 등록 (Pre-signed URL 방식)
 *     description: |
 *       상품을 등록합니다. 이미지는 먼저 /upload/presigned-urls API로 S3에 업로드한 후,
 *       업로드된 이미지 URL을 이 API에 전달해야 합니다.
 *
 *       ## 사용 흐름:
 *       1. POST /api/v1/upload/presigned-urls - Pre-signed URL 받기
 *       2. 각 Pre-signed URL로 이미지 업로드 (클라이언트 → S3 직접)
 *       3. POST /api/v1/products - 업로드된 이미지 URL과 함께 상품 등록
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - images
 *             properties:
 *               name:
 *                 type: string
 *                 example: 멋진 상품
 *               description:
 *                 type: string
 *                 example: 이 상품은 정말 멋습니다
 *               price:
 *                 type: integer
 *                 example: 50000
 *               images:
 *                 type: array
 *                 description: S3에 업로드된 이미지 URL 배열 (최소 1개, 최대 50개)
 *                 minItems: 1
 *                 maxItems: 50
 *                 items:
 *                   type: string
 *                   example: https://bucket.s3.amazonaws.com/products/123456.jpg
 *     responses:
 *       201:
 *         description: 상품 등록 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 상품이 등록되었습니다.
 *                 data:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                       format: uuid
 *                       example: 550e8400-e29b-41d4-a716-446655440000
 *                     images:
 *                       type: array
 *                       items:
 *                         type: string
 *       400:
 *         description: 잘못된 요청 (필수 필드 누락, 이미지 URL 없음)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 상품명과 가격은 필수 항목입니다.
 *       401:
 *         description: 인증 필요
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 인증이 필요합니다.
 *       500:
 *         description: 서버 에러
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 상품 등록 처리 중 오류가 발생했습니다.
 */
router.post('/products', authenticateToken, productController.createProduct);

/**
 * @swagger
 * /api/v1/products/{productId}:
 *   put:
 *     summary: 상품 수정 (본인 상품만 가능)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: 상품 ID (UUID)
 *         example: 550e8400-e29b-41d4-a716-446655440000
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: 수정된 상품명
 *               description:
 *                 type: string
 *                 example: 수정된 상품 설명
 *               price:
 *                 type: integer
 *                 example: 60000
 *               sell_status:
 *                 type: string
 *                 enum: [DRAFT, ACTIVE, DELETED, SOLD]
 *                 example: ACTIVE
 *               ply_url:
 *                 type: string
 *                 example: https://bucket.s3.amazonaws.com/ply/file.ply
 *     responses:
 *       200:
 *         description: 상품 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 상품이 수정되었습니다.
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 상품 ID가 필요합니다.
 *       401:
 *         description: 인증 필요
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 인증이 필요합니다.
 *       403:
 *         description: 권한 없음 (본인 상품 아님)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 상품을 수정할 권한이 없습니다.
 *       404:
 *         description: 상품을 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 상품을 찾을 수 없습니다.
 *       500:
 *         description: 서버 에러
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 상품 수정 중 오류가 발생했습니다.
 */
router.put('/products/:productId', authenticateToken, productController.updateProduct);

/**
 * @swagger
 * /api/v1/products/{productId}:
 *   delete:
 *     summary: 상품 삭제 (소프트 삭제, 본인 상품만 가능)
 *     description: 상품을 DELETED 상태로 변경합니다. SOLD 상태인 상품은 삭제할 수 없습니다.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: 상품 ID (UUID)
 *         example: 550e8400-e29b-41d4-a716-446655440000
 *     responses:
 *       200:
 *         description: 상품 삭제 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 상품이 삭제되었습니다.
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 상품 ID가 필요합니다.
 *       401:
 *         description: 인증 필요
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 인증이 필요합니다.
 *       404:
 *         description: 상품을 찾을 수 없음 또는 권한 없음 또는 이미 판매 완료됨
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 상품을 찾을 수 없거나 삭제할 수 없습니다.
 *       500:
 *         description: 서버 에러
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 상품 삭제 중 오류가 발생했습니다.
 */
router.delete('/products/:productId', authenticateToken, productController.deleteProduct);

/**
 * @swagger
 * /api/v1/my-products:
 *   get:
 *     summary: 내가 등록한 상품 목록 조회
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, ACTIVE, DELETED, SOLD, PROCESSING]
 *         description: 상품 상태 필터 (옵셔널)
 *     responses:
 *       200:
 *         description: 내 상품 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 내 상품 목록 조회에 성공했습니다.
 *                 data:
 *                   type: object
 *                   properties:
 *                     products:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ProductListItem'
 *       401:
 *         description: 인증 필요
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 인증이 필요합니다.
 *       500:
 *         description: 서버 에러
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 내 상품 목록 조회 중 오류가 발생했습니다.
 */
router.get('/my-products', authenticateToken, productController.getMyProducts);

/**
 * @swagger
 * /api/v1/products/{productId}/like:
 *   post:
 *     summary: 상품 좋아요 추가
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: 상품 ID (UUID)
 *         example: 550e8400-e29b-41d4-a716-446655440000
 *     responses:
 *       200:
 *         description: 좋아요 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 좋아요가 추가되었습니다.
 *       400:
 *         description: 잘못된 요청 또는 이미 좋아요함
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 이미 좋아요한 상품입니다.
 *       401:
 *         description: 인증 필요
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 인증이 필요합니다.
 *       404:
 *         description: 상품을 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 상품을 찾을 수 없습니다.
 *       500:
 *         description: 서버 에러
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 좋아요 추가 중 오류가 발생했습니다.
 */
router.post('/products/:productId/like', authenticateToken, productController.likeProduct);

/**
 * @swagger
 * /api/v1/products/{productId}/like:
 *   delete:
 *     summary: 상품 좋아요 취소
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: 상품 ID (UUID)
 *         example: 550e8400-e29b-41d4-a716-446655440000
 *     responses:
 *       200:
 *         description: 좋아요 취소 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 좋아요가 취소되었습니다.
 *       400:
 *         description: 잘못된 요청 또는 좋아요 하지 않은 상품
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 좋아요하지 않은 상품입니다.
 *       401:
 *         description: 인증 필요
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 인증이 필요합니다.
 *       404:
 *         description: 상품을 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 상품을 찾을 수 없습니다.
 *       500:
 *         description: 서버 에러
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 좋아요 취소 중 오류가 발생했습니다.
 */
router.delete('/products/:productId/like', authenticateToken, productController.unlikeProduct);


// Chat routes
/**
 * @swagger
 * /api/v1/chat/rooms:
 *   post:
 *     summary: 채팅방 생성 또는 조회
 *     description: 상품에 대한 채팅방을 생성하거나 이미 존재하는 경우 기존 채팅방을 반환합니다.
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *             properties:
 *               productId:
 *                 type: string
 *                 format: uuid
 *                 example: 550e8400-e29b-41d4-a716-446655440000
 *     responses:
 *       200:
 *         description: 채팅방 생성/조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     chat_room_id:
 *                       type: integer
 *                       example: 1
 *                     product_id:
 *                       type: string
 *                       example: 550e8400-e29b-41d4-a716-446655440000
 *                     buyer_id:
 *                       type: integer
 *                       example: 2
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: 잘못된 요청 (상품 ID 누락 또는 자신의 상품)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 상품 ID가 필요합니다.
 *       401:
 *         description: 인증 필요
 *       404:
 *         description: 상품을 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 상품을 찾을 수 없습니다.
 *       500:
 *         description: 서버 에러
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 서버 오류가 발생했습니다.
 */
router.post('/chat/rooms', authenticateToken, chatController.createOrGetChatRoom);

/**
 * @swagger
 * /api/v1/chat/rooms:
 *   get:
 *     summary: 채팅방 목록 조회
 *     description: 인증된 사용자의 모든 채팅방 목록을 조회합니다.
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 채팅방 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       chat_room_id:
 *                         type: integer
 *                         example: 1
 *                       product_id:
 *                         type: string
 *                         example: 550e8400-e29b-41d4-a716-446655440000
 *                       product_name:
 *                         type: string
 *                         example: 멋진 상품
 *                       product_price:
 *                         type: integer
 *                         example: 50000
 *                       product_image:
 *                         type: string
 *                         example: https://example.com/image.jpg
 *                       other_user_id:
 *                         type: integer
 *                         example: 3
 *                       other_user_nickname:
 *                         type: string
 *                         example: 홍길동
 *                       other_user_img:
 *                         type: string
 *                         nullable: true
 *                         example: https://example.com/profile.jpg
 *                       last_message:
 *                         type: string
 *                         nullable: true
 *                         example: 안녕하세요
 *                       last_message_at:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                       unread_count:
 *                         type: integer
 *                         example: 2
 *       401:
 *         description: 인증 필요
 *       500:
 *         description: 서버 에러
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 서버 오류가 발생했습니다.
 */
router.get('/chat/rooms', authenticateToken, chatController.getChatRooms);

/**
 * @swagger
 * /api/v1/chat/rooms/{chatRoomId}:
 *   get:
 *     summary: 채팅방 상세 조회
 *     description: 특정 채팅방의 상세 정보를 조회합니다.
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatRoomId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 채팅방 ID
 *         example: 1
 *     responses:
 *       200:
 *         description: 채팅방 상세 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     chat_room_id:
 *                       type: integer
 *                       example: 1
 *                     product_id:
 *                       type: string
 *                       example: 550e8400-e29b-41d4-a716-446655440000
 *                     product_name:
 *                       type: string
 *                       example: 멋진 상품
 *                     product_price:
 *                       type: integer
 *                       example: 50000
 *                     product_image:
 *                       type: string
 *                       example: https://example.com/image.jpg
 *                     seller:
 *                       type: object
 *                       properties:
 *                         member_id:
 *                           type: integer
 *                           example: 1
 *                         nickname:
 *                           type: string
 *                           example: 판매자
 *                         img:
 *                           type: string
 *                           nullable: true
 *                     buyer:
 *                       type: object
 *                       properties:
 *                         member_id:
 *                           type: integer
 *                           example: 2
 *                         nickname:
 *                           type: string
 *                           example: 구매자
 *                         img:
 *                           type: string
 *                           nullable: true
 *       401:
 *         description: 인증 필요
 *       404:
 *         description: 채팅방을 찾을 수 없거나 접근 권한이 없음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 채팅방을 찾을 수 없거나 접근 권한이 없습니다.
 *       500:
 *         description: 서버 에러
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 서버 오류가 발생했습니다.
 */
router.get('/chat/rooms/:chatRoomId', authenticateToken, chatController.getChatRoomDetail);

/**
 * @swagger
 * /api/v1/chat/rooms/{chatRoomId}/messages:
 *   get:
 *     summary: 메시지 목록 조회
 *     description: 특정 채팅방의 메시지 목록을 조회합니다. 조회 시 자동으로 읽음 처리됩니다.
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatRoomId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 채팅방 ID
 *         example: 1
 *     responses:
 *       200:
 *         description: 메시지 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       message_id:
 *                         type: integer
 *                         example: 1
 *                       chat_room_id:
 *                         type: integer
 *                         example: 1
 *                       sender_id:
 *                         type: integer
 *                         example: 2
 *                       sender_nickname:
 *                         type: string
 *                         example: 홍길동
 *                       content:
 *                         type: string
 *                         example: 안녕하세요
 *                       is_read:
 *                         type: boolean
 *                         example: true
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: 인증 필요
 *       403:
 *         description: 접근 권한 없음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 접근 권한이 없습니다.
 *       500:
 *         description: 서버 에러
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 서버 오류가 발생했습니다.
 */
router.get('/chat/rooms/:chatRoomId/messages', authenticateToken, chatController.getMessages);

/**
 * @swagger
 * /api/v1/chat/rooms/{chatRoomId}/messages:
 *   post:
 *     summary: 메시지 전송
 *     description: 특정 채팅방에 메시지를 전송합니다.
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatRoomId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 채팅방 ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 example: 안녕하세요, 이 상품 구매하고 싶습니다.
 *     responses:
 *       201:
 *         description: 메시지 전송 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     message_id:
 *                       type: integer
 *                       example: 1
 *                     chat_room_id:
 *                       type: integer
 *                       example: 1
 *                     sender_id:
 *                       type: integer
 *                       example: 2
 *                     content:
 *                       type: string
 *                       example: 안녕하세요
 *                     is_read:
 *                       type: boolean
 *                       example: false
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: 잘못된 요청 (메시지 내용 누락)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 메시지 내용이 필요합니다.
 *       401:
 *         description: 인증 필요
 *       403:
 *         description: 접근 권한 없음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 접근 권한이 없습니다.
 *       500:
 *         description: 서버 에러
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 서버 오류가 발생했습니다.
 */
router.post('/chat/rooms/:chatRoomId/messages', authenticateToken, chatController.sendMessage);

/**
 * @swagger
 * /api/v1/chat/rooms/{chatRoomId}/read:
 *   post:
 *     summary: 메시지 읽음 처리
 *     description: 특정 채팅방의 모든 안 읽은 메시지를 읽음 처리합니다.
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatRoomId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 채팅방 ID
 *         example: 1
 *     responses:
 *       200:
 *         description: 읽음 처리 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: integer
 *                       description: 읽음 처리된 메시지 수
 *                       example: 5
 *       401:
 *         description: 인증 필요
 *       403:
 *         description: 접근 권한 없음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 접근 권한이 없습니다.
 *       500:
 *         description: 서버 에러
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 서버 오류가 발생했습니다.
 */
router.post('/chat/rooms/:chatRoomId/read', authenticateToken, chatController.markAsRead);

// Notification routes
/**
 * @swagger
 * /api/v1/notifications:
 *   get:
 *     summary: 알림 목록 조회
 *     description: 인증된 사용자의 알림 목록을 조회합니다. 페이지네이션을 지원합니다.
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: 조회할 알림 개수 (1-100)
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: 건너뛸 알림 개수
 *       - in: query
 *         name: unreadOnly
 *         schema:
 *           type: boolean
 *           default: false
 *         description: true일 경우 읽지 않은 알림만 조회
 *     responses:
 *       200:
 *         description: 알림 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     notifications:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           notif_id:
 *                             type: integer
 *                             example: 1
 *                           member_id:
 *                             type: integer
 *                             example: 2
 *                           type:
 *                             type: string
 *                             enum: [CHAT, LIKE, PRODUCT_STATUS]
 *                             example: CHAT
 *                           title:
 *                             type: string
 *                             example: 새로운 메시지가 도착했습니다.
 *                           content:
 *                             type: string
 *                             example: 홍길동님이 메시지를 보냈습니다.
 *                           related_id:
 *                             type: string
 *                             nullable: true
 *                             example: 550e8400-e29b-41d4-a716-446655440000
 *                           is_read:
 *                             type: boolean
 *                             example: false
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                     total:
 *                       type: integer
 *                       example: 50
 *                     hasMore:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: 잘못된 요청 (유효하지 않은 limit 또는 offset 값)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: limit은 1에서 100 사이의 값이어야 합니다.
 *       401:
 *         description: 인증 필요
 *       500:
 *         description: 서버 에러
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 서버 오류가 발생했습니다.
 */
router.get('/notifications', authenticateToken, notificationController.getNotifications);

/**
 * @swagger
 * /api/v1/notifications/unread-count:
 *   get:
 *     summary: 읽지 않은 알림 개수 조회
 *     description: 인증된 사용자의 읽지 않은 알림 개수를 조회합니다.
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 읽지 않은 알림 개수 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: integer
 *                       example: 5
 *       401:
 *         description: 인증 필요
 *       500:
 *         description: 서버 에러
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 서버 오류가 발생했습니다.
 */
router.get('/notifications/unread-count', authenticateToken, notificationController.getUnreadCount);

/**
 * @swagger
 * /api/v1/notifications/{notifId}/read:
 *   patch:
 *     summary: 특정 알림 읽음 처리
 *     description: 특정 알림을 읽음 상태로 변경합니다.
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notifId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 알림 ID
 *         example: 1
 *     responses:
 *       200:
 *         description: 알림 읽음 처리 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     notif_id:
 *                       type: integer
 *                       example: 1
 *                     is_read:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: 잘못된 요청 (유효하지 않은 알림 ID)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 유효한 알림 ID가 필요합니다.
 *       401:
 *         description: 인증 필요
 *       404:
 *         description: 알림을 찾을 수 없거나 이미 읽은 알림
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 알림을 찾을 수 없거나 이미 읽은 알림입니다.
 *       500:
 *         description: 서버 에러
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 서버 오류가 발생했습니다.
 */
router.patch('/notifications/:notifId/read', authenticateToken, notificationController.markAsRead);

/**
 * @swagger
 * /api/v1/notifications/read-all:
 *   patch:
 *     summary: 모든 알림 읽음 처리
 *     description: 인증된 사용자의 모든 읽지 않은 알림을 읽음 상태로 변경합니다.
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 모든 알림 읽음 처리 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: integer
 *                       description: 읽음 처리된 알림 수
 *                       example: 10
 *       401:
 *         description: 인증 필요
 *       500:
 *         description: 서버 에러
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 서버 오류가 발생했습니다.
 */
router.patch('/notifications/read-all', authenticateToken, notificationController.markAllAsRead);

/**
 * @swagger
 * /api/v1/notifications/{notifId}:
 *   delete:
 *     summary: 알림 삭제
 *     description: 특정 알림을 삭제합니다.
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notifId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 알림 ID
 *         example: 1
 *     responses:
 *       200:
 *         description: 알림 삭제 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 알림이 삭제되었습니다.
 *       400:
 *         description: 잘못된 요청 (유효하지 않은 알림 ID)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 유효한 알림 ID가 필요합니다.
 *       401:
 *         description: 인증 필요
 *       404:
 *         description: 알림을 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 알림을 찾을 수 없습니다.
 *       500:
 *         description: 서버 에러
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 서버 오류가 발생했습니다.
 */
router.delete('/notifications/:notifId', authenticateToken, notificationController.deleteNotification);

// TODO: 추가 기능 라우트
// - AI 상품 설명 자동 생성
// - 3DGS 작업 관리

// AI description generation route
router.post('/products/ai/generate-description', productController.generateDescription);

export default router;
