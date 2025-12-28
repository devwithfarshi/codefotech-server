import 'dotenv/config';

// Import npm packages
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import hpp from 'hpp';
import status from 'http-status';
import morgan from 'morgan';
import path from 'path';
import { errorHandler, notFoundHandler } from './common/utils/errorHandler';

// Import Passport configuration

// Import Swagger configuration
import { setupSwagger } from './config/swagger-jsdoc';

// Import routes
import initializeRoutes from './common/utils/initializeRoutes';
import authRoutes from './modules/user/routes/auth.routes';
import userRoutes from './modules/user/routes/user.routes';
import blogRoutes from './modules/blog/routes/blog.routes';
const app: express.Application = express();

// CORS configuration
const corsOptions = {
  origin:
    process.env.NODE_ENV !== 'development' ? process.env.CORS_ORIGIN?.split(',') || [''] : '*',
  credentials: process.env.CORS_CREDENTIALS === 'true' || true,
};

// Rate limiting configuration
const rateLimitOptions = {
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
};

// File size limit
const maxFileSize = process.env.MAX_FILE_SIZE || '10mb';

//Middlewares
const allMiddlewares = [
  morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'),
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false,
  }),
  rateLimit(rateLimitOptions),
  hpp(),
  cors(corsOptions),
  cookieParser(),
  express.urlencoded({ extended: true }),
  express.json({
    limit: maxFileSize,
  }),
  // Sanitization middleware
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const sanitize = (obj: any): any => {
      if (!obj || typeof obj !== 'object') return obj;

      const result: Record<string, any> = Array.isArray(obj) ? [] : {};

      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          const sanitizedKey = key.replace(/^\$/, '_');
          if (typeof obj[key] === 'object' && obj[key] !== null) {
            result[sanitizedKey] = sanitize(obj[key]);
          } else {
            result[sanitizedKey] = obj[key];
          }
        }
      }

      return result;
    };

    if (req.body && typeof req.body === 'object') {
      req.body = sanitize(req.body);
    }
    next();
  },
];

// Use middlewares
app.use(allMiddlewares);

// Setup Swagger documentation
setupSwagger(app);

// Serve static files from uploads directory with CORS headers
const uploadPath = process.env.UPLOAD_PATH || './uploads';
app.use(
  '/uploads',
  (req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
  },
  express.static(path.resolve(uploadPath))
);

// Base route
app.get(['/', '/api/v1', '/health'], (req, res) => {
  res.status(status.OK).json({
    path: req.path,
    message: 'Welcome to the CodeFoTech API',
    status: 'healthy',
    environment: process.env.NODE_ENV || 'development',
    version: process.env.API_VERSION || '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      database: 'connected',
      api: 'operational',
    },
  });
});

// Use routes
initializeRoutes(app, '/api/v1', [
  { path: '/auth', router: authRoutes },
  { path: '/users', router: userRoutes },
  { path: '/blogs', router: blogRoutes },
]);

// Error handling middlewares
app.use(notFoundHandler);

// JSON parsing error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof SyntaxError && (err as any).status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON format in request body',
      error: 'Malformed JSON',
    });
  }
  return next(err);
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  errorHandler(err, req, res, next);
});

export default app;
