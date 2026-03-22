import express from "express";
import auth from "../middlewares/auth.js";
import profileController from "../controllers/profileController.js";
import profileValidations from "../validations/profileValidation.js";
import validate from "../middlewares/validate.js";
import { profileLimiter } from "../middlewares/rateLimiter.js";

const Router = express.Router();

Router.get('/', auth, profileController.getMyProfile);
Router.patch('/', auth, profileValidations.updateMyProfile, validate, profileLimiter, profileController.updateMyProfile);
Router.delete('/', auth, profileController.deleteMyProfile);
Router.patch('/change-password', auth, profileValidations.updatePassword, validate, profileLimiter, profileController.updatePassword);
Router.patch('/change-email', auth, profileValidations.updateEmail, validate, profileLimiter, profileController.updateEmail);
Router.get('/confirm-email', profileValidations.confirmEmail, validate, profileController.confirmEmailUpdate);
Router.get('/attended-events', auth, profileController.getAttendEvents);
Router.get('/preferences', auth, profileController.getPreferences);
Router.patch('/change-preferences', auth, profileValidations.updatePreferences, validate, profileController.updatePreferences);

export default Router;