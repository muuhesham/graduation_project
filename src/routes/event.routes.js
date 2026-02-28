import express from 'express';
import validate from '../middlewares/validate.js';
import auth from '../middlewares/auth.js';
import { paymentLimiter } from '../middlewares/rateLimiter.js';
import eventValidation from '../validations/eventValidation.js';
import eventController from '../controllers/eventController.js';

const Router = express.Router();

Router.get('/:id', eventValidation.show, validate, eventController.show);

Router.post(
    '/:id/checkout',
    paymentLimiter,
    auth,
    eventValidation.checkout,
    validate,
    eventController.checkout
);

Router.post('/:id/interested', auth, eventController.addToInterested);
Router.delete('/:id/interested', auth, eventController.removeFromInterested);


export default Router;
