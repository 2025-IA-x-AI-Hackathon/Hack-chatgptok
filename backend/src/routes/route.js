import express from 'express';

import userController from '../controllers/userController.js';
import productController from '../controllers/productController.js';
import authController from '../controllers/authController.js';
import uploadController from '../controllers/uploadController.js';

// middleware
import isAuthenticated from '../middleware/auth.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

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
 *                 status:
 *                   type: string
 *                   example: ok
 *                 message:
 *                   type: string
 *                   example: Server is running
 */
router.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// Auth routes (JWT 기반)
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/logout', authenticateToken, authController.logout);
router.post('/auth/refresh', authController.refreshToken);
router.get('/auth/me', authenticateToken, authController.getMe);

/**
 * @swagger
 * /api/v1/upload/presigned-url:
 *   get:
 *     summary: 단일 파일 업로드를 위한 Pre-signed URL 생성
 *     tags: [Upload]
 *     security:
 *       - cookieAuth: []
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
 *         description: 파일 MIME 타입
 *         example: image/jpeg
 *     responses:
 *       200:
 *         description: Pre-signed URL 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 uploadUrl:
 *                   type: string
 *                   description: S3 업로드용 임시 URL
 *                 fileUrl:
 *                   type: string
 *                   description: 업로드 후 접근할 최종 URL
 *                 key:
 *                   type: string
 *                   description: S3 객체 키
 *                 expiresIn:
 *                   type: integer
 *                   description: URL 유효 시간(초)
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 필요
 */
router.get('/upload/presigned-url', authenticateToken, uploadController.getPresignedUrl);

/**
 * @swagger
 * /api/v1/upload/presigned-urls:
 *   post:
 *     summary: 여러 파일 업로드를 위한 Pre-signed URL 일괄 생성
 *     tags: [Upload]
 *     security:
 *       - cookieAuth: []
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
 *                       example: image/jpeg
 *     responses:
 *       200:
 *         description: Pre-signed URL 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 uploads:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       originalFilename:
 *                         type: string
 *                       uploadUrl:
 *                         type: string
 *                       fileUrl:
 *                         type: string
 *                       key:
 *                         type: string
 *                 expiresIn:
 *                   type: integer
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 필요
 */
router.post('/upload/presigned-urls', authenticateToken, uploadController.getMultiplePresignedUrls);

/**
 * @swagger
 * /api/v1/users/profile:
 *   get:
 *     summary: 내 프로필 조회
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: 프로필 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: 인증 필요
 */
router.get('/users/profile', authenticateToken, userController.getProfile);

/**
 * @swagger
 * /api/v1/users/profile:
 *   put:
 *     summary: 프로필 수정
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: johndoe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: 프로필 수정 성공
 *       401:
 *         description: 인증 필요
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
 *           default: 10
 *         description: 페이지당 항목 수
 *     responses:
 *       200:
 *         description: 상품 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
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
 *           type: integer
 *         description: 상품 ID
 *     responses:
 *       200:
 *         description: 상품 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: 상품을 찾을 수 없음
 */
router.get('/products/:productId', productController.getProductById);

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
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - imageUrls
 *             properties:
 *               name:
 *                 type: string
 *                 example: 멋진 상품
 *               description:
 *                 type: string
 *                 example: 이 상품은 정말 멋습니다
 *               price:
 *                 type: number
 *                 example: 10000
 *               imageUrls:
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
 *                 message:
 *                   type: string
 *                   example: Product created successfully
 *                 productId:
 *                   type: integer
 *                   example: 123
 *                 imageUrls:
 *                   type: array
 *                   items:
 *                     type: string
 *       400:
 *         description: 잘못된 요청 (필수 필드 누락, 이미지 URL 없음)
 *       401:
 *         description: 인증 필요
 */
router.post('/products', authenticateToken, productController.createProduct);

/**
 * @swagger
 * /api/v1/products/{productId}:
 *   put:
 *     summary: 상품 수정
 *     tags: [Products]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 상품 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               image_url:
 *                 type: string
 *     responses:
 *       200:
 *         description: 상품 수정 성공
 *       401:
 *         description: 인증 필요
 *       404:
 *         description: 상품을 찾을 수 없음
 */
router.put('/products/:productId', authenticateToken, productController.updateProduct);

/**
 * @swagger
 * /api/v1/products/{productId}:
 *   delete:
 *     summary: 상품 삭제
 *     tags: [Products]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 상품 ID
 *     responses:
 *       200:
 *         description: 상품 삭제 성공
 *       401:
 *         description: 인증 필요
 *       404:
 *         description: 상품을 찾을 수 없음
 */
router.delete('/products/:productId', authenticateToken, productController.deleteProduct);

/**
 * @swagger
 * /api/v1/my-products:
 *   get:
 *     summary: 내가 등록한 상품 목록 조회
 *     tags: [Products]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: 내 상품 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       401:
 *         description: 인증 필요
 */
router.get('/my-products', authenticateToken, productController.getMyProducts);

/**
 * @swagger
 * /api/v1/products/{productId}/like:
 *   post:
 *     summary: 상품 좋아요
 *     tags: [Products]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 상품 ID
 *     responses:
 *       200:
 *         description: 좋아요 성공
 *       401:
 *         description: 인증 필요
 */
router.post('/products/:productId/like', authenticateToken, productController.likeProduct);

/**
 * @swagger
 * /api/v1/products/{productId}/like:
 *   delete:
 *     summary: 상품 좋아요 취소
 *     tags: [Products]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 상품 ID
 *     responses:
 *       200:
 *         description: 좋아요 취소 성공
 *       401:
 *         description: 인증 필요
 */
router.delete('/products/:productId/like', authenticateToken, productController.unlikeProduct);

// AI description generation route
router.post('/products/ai/generate-description', productController.generateDescription);

// TODO: 추가 기능 라우트
// - 채팅 기능
// - 알림 기능

export default router;
