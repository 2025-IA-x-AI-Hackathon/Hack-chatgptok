import express from 'express';

import userController from '../controllers/userController.js';
import productController from '../controllers/productController.js';

// middleware
import isAuthenticated from '../middleware/auth.js';

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// Auth routes
router.post('/auth/signup', userController.signup);
router.post('/auth/login', userController.login);
router.post('/auth/logout', isAuthenticated, userController.logout);

// User routes
router.get('/users/profile', isAuthenticated, userController.getProfile);
router.put('/users/profile', isAuthenticated, userController.updateProfile);

// Product routes
router.get('/products', productController.getProductList);
router.get('/products/:productId', productController.getProductById);
router.post('/products', isAuthenticated, productController.createProduct);
router.put('/products/:productId', isAuthenticated, productController.updateProduct);
router.delete('/products/:productId', isAuthenticated, productController.deleteProduct);
router.get('/my-products', isAuthenticated, productController.getMyProducts);

// Product like routes
router.post('/products/:productId/like', isAuthenticated, productController.likeProduct);
router.delete('/products/:productId/like', isAuthenticated, productController.unlikeProduct);

// TODO: 추가 기능 라우트
// - AI 상품 설명 자동 생성
// - 3DGS 작업 관리
// - 좋아요 기능
// - 채팅 기능
// - 알림 기능

export default router;
