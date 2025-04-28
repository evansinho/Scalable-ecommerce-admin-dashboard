import express, { Application } from 'express';
import cors from "cors";
import routes from './routes/index';

const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', routes);

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`API running at http://localhost:${port}`);
});
