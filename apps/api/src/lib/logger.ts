import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({ format: winston.format.simple() }),
    new winston.transports.File({ filename: 'logs/app.log' })
  ]
});

// Example usage
logger.info('Server started successfully!');
logger.error('Failed to process payment', { error: 'Payment gateway error' });

export { logger };
