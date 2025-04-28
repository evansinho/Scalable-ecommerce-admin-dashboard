import express from 'express';
import { 
  getAllUsers, 
  loginUser, 
  signupUser 
} from '../controllers/userController';
import { 
  createProduct, 
  getAllProducts, 
  updateProduct, 
  deleteProduct   
} from '../controllers/productController';
import { 
  createOrder, 
  getUserOrders, 
  getAllOrders  
} from '../controllers/orderController';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roles';

const router = express.Router();

// User routes
router.post('/signup', signupUser);
router.post('/login', loginUser);
router.get('/users', authenticate, requireRole('ADMIN'), getAllUsers);

// Product routes
router.post('/products', authenticate, requireRole('ADMIN'), createProduct);
router.get('/products', authenticate, getAllProducts);
router.put('/products/:id', authenticate, updateProduct);
router.delete('/products/:id', authenticate, deleteProduct);

// Order routes
router.post('/orders', authenticate, createOrder);
router.get('/orders', authenticate, requireRole('ADMIN'),  getAllOrders);
router.get('/orders/:userId', authenticate, getUserOrders);

export default router;
