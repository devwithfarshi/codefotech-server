import express, { Router } from 'express';
import contactRoutes from './contact.routes';
const router: Router = express.Router();

router.use('/contact', contactRoutes);

export default router;
