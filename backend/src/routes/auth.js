import { Router } from 'express'
import { login, register, refresh, updateProfile, updatePassword } from '../controllers/authController.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()
router.post('/register', register)
router.post('/login', login)
router.post('/refresh', refresh)
router.put('/profile', authenticate, updateProfile)
router.put('/password', authenticate, updatePassword)
export default router