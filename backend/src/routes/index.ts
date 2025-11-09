import { Router } from "express";
import authRoutes from "./auth.js";
import productsRoutes from "./products.js";
import { PrismaClient } from '../generated/prisma/client.js';

export const prisma = new PrismaClient({ log: ['query'] });

const rootRouter: Router = Router();

rootRouter.use('/auth', authRoutes);
rootRouter.use('/products', productsRoutes);

export default rootRouter;