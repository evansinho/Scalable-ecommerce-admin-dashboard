import { Queue } from 'bullmq';
import connection from './redis';

export const orderQueue = new Queue('orders', { 
  connection,   
  defaultJobOptions: {
  attempts: 5, // Retry 5 times
  backoff: {
    type: 'exponential', // exponential backoff
    delay: 1000, // start retrying after 1 second
    },
  }
});
