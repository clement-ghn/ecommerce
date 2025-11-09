import {Router} from 'express';
import { createProduct, getProductById, getProducts, updateProduct, deleteProduct } from '../controllers/products.js';
import { authMiddleware, adminMiddleware } from '../middlewares/auth.js';

const productsRoutes:Router = Router();

// Route publique pour GET (tous les utilisateurs)
// productsRoutes.get('/', getProducts);

// Route protégée pour POST (admin uniquement)
productsRoutes.post('/', [authMiddleware, adminMiddleware], createProduct);
productsRoutes.get('/', getProducts);
productsRoutes.get('/:id', getProductById);
productsRoutes.put('/:id', [authMiddleware, adminMiddleware], updateProduct);
productsRoutes.delete('/:id', [authMiddleware, adminMiddleware], deleteProduct);

export default productsRoutes;
