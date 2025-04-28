import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import routes from './routes/index';
import * as Sentry from '@sentry/node';
import { requestDuration, requestCounter, register } from './lib/prometheus';

const app: Application = express();

// Sentry configuration
Sentry.init({
  dsn: process.env.SENTRY_DSN || 'your_sentry_dsn_here',
  integrations: [
    Sentry.httpIntegration(),
    Sentry.expressIntegration(),
  ],
  // Tracing configuration
  tracePropagationTargets: ["localhost", /^\//],
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  environment: process.env.NODE_ENV || 'development',
});

// Middleware setup
app.use(Sentry.expressErrorHandler());
app.use(cors());
app.use(express.json());

// Prometheus middleware
app.use((req, res, next) => {
  // Start timer for request duration
  const end = requestDuration.startTimer();
  res.on('finish', () => {
    // Stop timer and record duration
    end();
    // Increment request counter with useful labels
    requestCounter.inc({
      method: req.method,
      route: req.route ? req.route.path : req.path,
      statusCode: res.statusCode,
    });
  });
  next();
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Routes
app.use('/api', routes);

// Custom error middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  Sentry.captureException(err);
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`API running at http://localhost:${port}`);
});
