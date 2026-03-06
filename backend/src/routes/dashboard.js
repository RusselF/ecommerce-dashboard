import { Router } from 'express'
import { getStats } from '../controllers/dashboardController.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'

const router = Router()
router.get('/stats', authenticate, requireAdmin, getStats)
export default router