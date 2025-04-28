import { Request, Response } from 'express';
import { PrismaClient } from '../../generated/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

const prisma = new PrismaClient();

// signup user
export const signupUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(400).json({ error: 'Email already exists' });
            return;
        }
        if (!name || !email || !password) {
            res.status(400).json({ error: 'Name, email, and password are required' });
            return;
        }
        if (password.length < 6) {
            res.status(400).json({ error: 'Password must be at least 6 characters long' });
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            res.status(400).json({ error: 'Invalid email format' });
            return;
        }
        const hashed = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({ data: { email, password: hashed, name } });
        res.json({ id: user.id, email: user.email });
    } catch (error: any) {
        if (error.code === 'P2002') {
            res.status(400).json({ error: 'Email already exists' });
        } else {
            res.status(500).json({ error: 'Failed to create user', details: error.message });
        }
    }
};

// login user
export const loginUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            res.status(401).json({ error: 'Wrong password' });
            return;
        }

        const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to login', details: error.message });
    }
};

// Get all users
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const users = await prisma.user.findMany();
        res.json(users);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch users', details: error.message });
    }
};
