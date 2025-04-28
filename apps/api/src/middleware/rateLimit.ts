import rateLimit from 'express-rate-limit';
import rateLimitRedis from 'rate-limit-redis';
import redis from '../lib/redis';

const limiter = rateLimit({
  store: new rateLimitRedis({
    client: redis,
  }as any),
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many requests, please try again later.',
});

export default limiter;
