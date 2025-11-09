import {Router} from 'express'
import { signup, login, me } from '../controllers/auth.js'
import { authMiddleware } from '../middlewares/auth.js'

const authRoutes: Router = Router()

authRoutes.post('/signup', signup)
authRoutes.post('/login', login)
authRoutes.get('/me', authMiddleware, me)

export default authRoutes