import { Request, Response } from 'express';
import { PrismaClient } from '../../generated/prisma';
import redis from '../lib/redis';
import { orderQueue } from '../lib/queue';
import { logger } from '../lib/logger';

const prisma = new PrismaClient()

// Create an order
export const createOrder = async (req: Request, res: Response) => {
    try {
        const { userId, productId, quantity } = req.body;
        const order = await prisma.order.create({ data: { userId, productId, quantity } });
        // Invalidate the cache
        await redis.del('orders:all');
        // Add jobs to the queue
        // Add job to send confirmation email
        await orderQueue.add('sendConfirmationEmail', {
            userId: userId,
            orderId: order.id,
        });
        // Add job to update inventory
        await orderQueue.add('updateInventory', {
            productId,
            quantity,
        });
        
        logger.info('Order created successfully', { orderId: order.id });
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

        logger.info('Fetched user orders', { userId, count: orders.length });
        res.json(orders);
    } catch (error: any) {
        logger.error('Failed to create order', { error: error.message });
        res.status(500).json({ error: 'Failed to fetch orders', details: error.message });
    }
};

// Get all orders
export const getAllOrders = async (req: Request, res: Response, next: Function): Promise<void> => {
    try {
        const cacheKey = 'orders:all';
        // Try cache first
        const cached = await redis.get(cacheKey);
        if (cached) {
            res.json(JSON.parse(cached)); // Send the cached response
            return; // Ensure the function ends here
        }

        const orders = await prisma.order.findMany({ include: { user: true, product: true } });
        // Cache result
        await redis.set(cacheKey, JSON.stringify(orders), 'EX', 60); // Cache for 60 seconds

        logger.info('Fetched all orders from DB', { count: orders.length });
        res.json(orders);
    } catch (error: any) {
        next(error);
        logger.error('Failed to fetch all orders', { error: error.message });
        // Handle the error response
        res.status(500).json({ error: 'Failed to fetch orders', details: error.message });
    }
};
