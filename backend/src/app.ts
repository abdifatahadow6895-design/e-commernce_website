import express from 'express';
import passport from 'passport';
import path from 'path';
import { fileURLToPath } from 'url';
import swaggerUi from 'swagger-ui-express';
import { applySecurityMiddleware } from './middleware/security.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { stripeWebhook } from './controllers/paymentController.js';
import routes from './routes/index.js';
import { config } from './config/index.js';
import { swaggerSpec } from './swagger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

applySecurityMiddleware(app);

app.use(passport.initialize());

app.post(
  '/api/payments/stripe/webhook',
  express.raw({ type: 'application/json' }),
  stripeWebhook
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/uploads', express.static(path.join(__dirname, '..', config.upload.dir)));
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api', routes);

app.get('/', (_req, res) => {
  res.json({
    name: 'NexShop API',
    version: '1.0.0',
    docs: '/api/health',
  });
});

app.use(notFound);
app.use(errorHandler);

export default app;
