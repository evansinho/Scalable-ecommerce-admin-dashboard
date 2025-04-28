import { Worker } from 'bullmq';
import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();

const worker = new Worker('orders', async (job) => {
  if (job.name === 'sendConfirmationEmail') {
    const { userId, orderId } = job.data;
    console.log(`📧 Sending email to user ${userId} for order ${orderId}`);
    // Here, you could integrate with SendGrid, Mailgun, etc
    // Simulate email sending with a delay
    await new Promise(resolve => setTimeout(resolve, 3000)); // Simulating email sending delay
    console.log(`✅ Email sent to user ${userId} for order ${orderId}`);
  }

  if (job.name === 'updateInventory') {
    const { productId, quantity } = job.data;
    console.log(`🔄 Updating inventory for product ${productId} by ${quantity}`);

    await prisma.product.update({
      where: { id: productId },
      data: { stock: { decrement: quantity } },
    });

    console.log(`✅ Inventory updated`);
  }
}, {
  connection: {
    host: 'localhost',
    port: 6379,
  },
});

worker.on('completed', (job) => {
  console.log(`✅ Job ${job.id} has been completed`);
});

worker.on('failed', (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err);
});
