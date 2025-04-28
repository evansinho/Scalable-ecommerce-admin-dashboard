import { Request, Response } from 'express';
import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient()

// Create an order
export const createOrder = async (req: Request, res: Response) => {
    try {
        const { userId, productId, quantity } = req.body;
        const order = await prisma.order.create({ data: { userId, productId, quantity } });
        res.json(order);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to create order', details: error.message });
    }
};

// Get all orders for a user
export const getUserOrders = async (req: Request, res: Response) => {
    try {
        const userId = req.params.userId;
        const orders = await prisma.order.findMany({ where: { userId: Number(userId) } });
        res.json(orders);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch orders', details: error.message });
    }
};

// Get all orders
export const getAllOrders = async (req: Request, res: Response) => {
    try {
        const orders = await prisma.order.findMany({ include: { user: true, product: true } });
        res.json(orders);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch orders', details: error.message });
    }
};
