import { Router } from 'express'
import { getOrders, createOrder, updateOrderStatus } from '../controllers/orderController.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'

const router = Router()
router.get('/', authenticate, getOrders)
router.post('/', authenticate, createOrder)
router.patch('/:id/status', authenticate, requireAdmin, updateOrderStatus)
export default router