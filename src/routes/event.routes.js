import express from 'express';

import eventValidation from '../validations/eventValidation.js';
import eventController from '../controllers/eventController.js';

const Router = express.Router();

Router.get('/:organizerId/:eventSlug', eventValidation.show, eventController.show);

export default Router;
