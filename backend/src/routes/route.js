import express from 'express';

import userController from '../controllers/userController.js';
import productController from '../controllers/productController.js';
import authController from '../controllers/authController.js';
import uploadController, { upload } from '../controllers/uploadController.js';

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
 *     summary: 상품 등록
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
 *               - title
 *               - description
 *               - price
 *             properties:
 *               title:
 *                 type: string
 *                 example: 멋진 상품
 *               description:
 *                 type: string
 *                 example: 이 상품은 정말 멋집니다
 *               price:
 *                 type: number
 *                 example: 10000
 *               image_url:
 *                 type: string
 *                 example: https://example.com/image.jpg
 *     responses:
 *       201:
 *         description: 상품 등록 성공
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

/**
 * @swagger
 * /api/v1/upload/image:
 *   post:
 *     summary: 이미지 업로드 및 Pre-signed URL 생성
 *     tags: [Upload]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: 업로드할 이미지 파일 (jpg/png/gif/webp)
 *     responses:
 *       200:
 *         description: 이미지 업로드 성공
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
 *                   example: Image uploaded successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     fileName:
 *                       type: string
 *                       example: 550e8400-e29b-41d4-a716-446655440000.jpg
 *                     s3Key:
 *                       type: string
 *                       example: images/550e8400-e29b-41d4-a716-446655440000.jpg
 *                     presignedUrl:
 *                       type: string
 *                       example: https://ss-s3-project.s3.ap-northeast-2.amazonaws.com/...
 *                     publicUrl:
 *                       type: string
 *                       example: https://ss-s3-project.s3.ap-northeast-2.amazonaws.com/images/550e8400-e29b-41d4-a716-446655440000.jpg
 *       400:
 *         description: 파일이 업로드되지 않음
 *       401:
 *         description: 인증 필요
 */
router.post('/upload/image', authenticateToken, upload.single('image'), uploadController.uploadImage);

// TODO: 추가 기능 라우트
// - 채팅 기능
// - 알림 기능

export default router;
