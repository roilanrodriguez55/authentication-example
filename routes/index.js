import express from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';

const router = express.Router();

// Rutas principales
router.get('/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

// Montar otras rutas aquí
router.use('/auth', authRoutes);
router.use('/users', userRoutes);

export default router;

