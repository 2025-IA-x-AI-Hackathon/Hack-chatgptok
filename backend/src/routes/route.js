import express from 'express';

import userController from '../controllers/userController.js';
import productController from '../controllers/productController.js';
import authController from '../controllers/authController.js';
import chatController from '../controllers/chatController.js';

// middleware
import isAuthenticated from '../middleware/auth.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// Auth routes (JWT 기반)
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/logout', authenticateToken, authController.logout);
router.post('/auth/refresh', authController.refreshToken);
router.get('/auth/me', authenticateToken, authController.getMe);

// User routes
router.get('/users/profile', authenticateToken, userController.getProfile);
router.put('/users/profile', authenticateToken, userController.updateProfile);

// Product routes
router.get('/products', productController.getProductList);
router.get('/products/:productId', productController.getProductById);
router.post('/products', authenticateToken, productController.createProduct);
router.put('/products/:productId', authenticateToken, productController.updateProduct);
router.delete('/products/:productId', authenticateToken, productController.deleteProduct);
router.get('/my-products', authenticateToken, productController.getMyProducts);

// Product like routes
router.post('/products/:productId/like', authenticateToken, productController.likeProduct);
router.delete('/products/:productId/like', authenticateToken, productController.unlikeProduct);

// Chat routes
router.post('/chat/rooms', authenticateToken, chatController.createOrGetChatRoom);
router.get('/chat/rooms', authenticateToken, chatController.getChatRooms);
router.get('/chat/rooms/:chatRoomId', authenticateToken, chatController.getChatRoomDetail);
router.get('/chat/rooms/:chatRoomId/messages', authenticateToken, chatController.getMessages);
router.post('/chat/rooms/:chatRoomId/messages', authenticateToken, chatController.sendMessage);
router.post('/chat/rooms/:chatRoomId/read', authenticateToken, chatController.markAsRead);

// TODO: 추가 기능 라우트
// - AI 상품 설명 자동 생성
// - 3DGS 작업 관리
// - 알림 기능

export default router;
