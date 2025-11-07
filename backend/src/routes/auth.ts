import {Router} from 'express'
import { signup } from '../controllers/auth.js'
import { login } from '../controllers/auth.js'

const authRoutes: Router = Router()

authRoutes.post('/signup', signup)

authRoutes.post('/login', login)

export default authRoutes