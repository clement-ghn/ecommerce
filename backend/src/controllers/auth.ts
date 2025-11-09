import { PrismaClient } from '../generated/prisma/client.js';
import { type Request, type Response } from 'express';
import {hashSync, compareSync} from 'bcrypt';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../secret.js';
import { signUpSchema } from '../schema/users.js';


const prisma = new PrismaClient();

export const signup = async (req: Request, res: Response) => {
    try {
        const { email, name, password } = req.body;

        const parsed = signUpSchema.safeParse({ email, name, password });
        if (!parsed.success) {
            // Renvoyer les erreurs de validation détaillées
            const errors = parsed.error.issues.map((err) => err.message).join(', ');
            return res.status(400).json({ error: errors });
        }

        let user = await prisma.user.findUnique({
        where: { email }
        });
        if (user) {
            return res.status(400).json({ error: 'User already exists' });
        }
        user = await prisma.user.create({
            data: {
                email,
                name,
                password: hashSync(password, 10)
            }
        });
        res.json({ 
            message: `User ${name} signed up successfully`,
            user: { id: user.id, email: user.email, name: user.name }
        });
    } catch (error) {
        console.error('Error signing up user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
    
}

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
        where: { email }
    });

    if (!user) {
        return res.status(400).json({ error: 'Invalid email or password' });
    }

    const isValid = compareSync(password, user.password);
    if (!isValid) {
        return res.status(400).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
        { userId: user.id },
        JWT_SECRET,
        { expiresIn: '1h' }
    );

    res.json({ 
        message: `User ${user.name} logged in successfully`,
        token
    });
}

export const me = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Non authentifié' });
        }

        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            select: { 
                id: true, 
                name: true, 
                email: true, 
                role: true 
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
