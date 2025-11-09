import { type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../secret.js';
import { PrismaClient } from '../generated/prisma/client.js';

const prisma = new PrismaClient();

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        role: string;
      };
    }
  }
}

// Middleware pour vérifier le token JWT
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Token manquant' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    
    // Récupérer l'utilisateur depuis la DB
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true }
    });
    
    if (!user) {
      return res.status(401).json({ error: 'Utilisateur non trouvé' });
    }
    
    // Ajouter l'utilisateur à la requête
    req.user = {
      userId: user.id,
      role: user.role
    };
    
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token invalide ou expiré' });
  }
};

// Middleware pour vérifier si l'utilisateur est admin
export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Non authentifié' });
  }
  
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Accès refusé. Droits administrateur requis.' });
  }
  
  next();
};
