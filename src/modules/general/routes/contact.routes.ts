import express, { Router } from 'express';
import contactController from '../controller/contact.controller';
const router: Router = express.Router();

router.post('/', contactController.contact);

export default router;
