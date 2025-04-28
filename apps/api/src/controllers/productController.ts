import { NextFunction, Request, Response } from 'express';
import { PrismaClient } from '../../generated/prisma';
import redis from '../lib/redis';
import { logger } from '../lib/logger';

const prisma = new PrismaClient()

// createProduct function to handle product creation
export const createProduct = async (req: Request, res: Response) => {
    try {
        const { name, description, price } = req.body;
        const product = await prisma.product.create({ data: { name, description, price } });
        // Invalidate the cache
        await redis.del('products:all');

        logger.info('Product created successfully', { productId: product.id });
        res.json(product);
    } catch (error: any) {
        logger.error('Failed to create product', { error: error.message });
        res.status(500).json({ error: 'Failed to create product', details: error.message });
    }
};

// getAllProducts function to fetch all products
export const getAllProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const cacheKey = 'products:all';
        const cached = await redis.get(cacheKey);
        if (cached) {
            res.json(JSON.parse(cached)); // Send the cached response
            return;
        }

        const products = await prisma.product.findMany();

        logger.info('Fetched all products', { count: products.length });
        await redis.set(cacheKey, JSON.stringify(products), 'EX', 60); // Cache for 60 seconds
        res.json(products);
    } catch (error: any) {
        next(error);
        logger.error('Failed to fetch products', { error: error.message });
        res.status(500).json({ error: 'Failed to fetch products', details: error.message });
    }
};

// updateProduct function to handle product updates by ID
export const updateProduct = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, description, price } = req.body;

    try {
        const product = await prisma.product.update({
            where: { id: Number(id) },
            data: { name, description, price },
        });

        // Invalidate the cache
        await redis.del('products:all');
        logger.info('Product updated successfully', { productId: product.id });
        res.json(product);
    } catch (error: any) {
        logger.error('Failed to update product', { error: error.message });
        res.status(500).json({ error: 'Failed to update product', details: error.message });
    }
}

// deleteProduct function to handle product deletion by ID
export const deleteProduct = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        await prisma.product.delete({ where: { id: Number(id) } });
        // Invalidate the cache
        await redis.del('products:all');
        logger.info('Product deleted successfully', { productId: id });
        res.json({ message: 'Product deleted successfully' });
    } catch (error: any) {
        logger.error('Failed to delete product', { error: error.message });
        res.status(500).json({ error: 'Failed to delete product', details: error.message });
    }
}
