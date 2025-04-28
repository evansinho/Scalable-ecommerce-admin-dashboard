// metrics.ts
import promClient from 'prom-client';

// Create a histogram to track request durations
const requestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Histogram of HTTP request durations in seconds',
  buckets: [0.1, 0.2, 0.5, 1, 2, 5], // you can adjust these
});

// Create a counter to track number of HTTP requests
const requestCounter = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests received',
  labelNames: ['method', 'route', 'statusCode'], // optional: add richer dimensions
});

// Export both metrics and the registry
export const register = promClient.register;
export { requestDuration, requestCounter };
