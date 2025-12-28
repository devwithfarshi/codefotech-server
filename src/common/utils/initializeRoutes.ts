import { Application, Router } from 'express';

/**
 * Route configuration interface
 */
interface RouteConfig {
  path: string;
  router: Router;
}

/**
 * Initializes API routes with proper path prefixing
 * @param app Express application instance
 * @param basePath Base API path (e.g., '/api/v1')
 * @param routes Array of route configurations
 */
const initializeRoutes = (app: Application, basePath: string, routes: RouteConfig[]) => {
  if (!app) {
    throw new Error('Express application instance is required');
  }

  if (!Array.isArray(routes)) {
    throw new Error('Routes must be an array of route configurations');
  }

  // Normalize base path (ensure it starts with '/' and doesn't end with '/')
  const normalizedBasePath = basePath ? (basePath.startsWith('/') ? basePath : `/${basePath}`) : '';

  // Register each route with proper path joining
  routes.forEach((route) => {
    if (!route || typeof route !== 'object') {
      console.warn('Invalid route configuration skipped');
      return;
    }

    const { path, router } = route;

    if (!router) {
      console.warn(`No router provided for path "${path}", skipping`);
      return;
    }

    // Normalize route path (ensure it starts with '/')
    const normalizedRoutePath = path ? (path.startsWith('/') ? path : `/${path}`) : '';

    // Join base path with route path
    const fullPath = `${normalizedBasePath}${normalizedRoutePath}`;

    // Register the route
    app.use(fullPath, router);
    console.log(`Route registered: ${fullPath}`);
  });
};

export default initializeRoutes;
