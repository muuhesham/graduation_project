import express from 'express';
import auth from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import { publicLimiter } from '../middlewares/rateLimiter.js';
import reviewValidation from '../validations/reviewValidation.js';
import reviewController from '../controllers/reviewController.js';

const Router = express.Router();

Router.post('/:eventId', auth, reviewValidation.create, validate, reviewController.create);
Router.put('/:id', auth, reviewValidation.update, validate, reviewController.update);
Router.delete('/:id', auth, reviewValidation.delete, validate, reviewController.delete);
Router.get('/:eventId', publicLimiter, reviewValidation.getByEventId, validate, reviewController.getByEventId);
Router.get('/:eventId/my-review', auth, reviewValidation.getUserEventReview, validate, reviewController.getUserEventReview);

export default Router;
