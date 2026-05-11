import { Router } from 'express';
import mobileController from '../../controllers/mobile/mobileController.js';
import mobileValidations from '../../validations/mobileValidation.js';
import validate from '../../middlewares/validate.js';
import organizerAuth from '../../middlewares/organizerAuth.js';
import { authLimiter } from '../../middlewares/rateLimiter.js';

const router = Router();

router.post('/login', authLimiter, mobileValidations.login, validate, mobileController.login);
router.post('/scan', organizerAuth, mobileValidations.scan, validate, mobileController.scan);

export default router;
