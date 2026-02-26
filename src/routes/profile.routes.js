import express from "express";
import auth from "../middlewares/auth.js";
import profileController from "../controllers/profileController.js";
import profileValidations from "../validations/profileValidation.js";
import validate from "../middlewares/validate.js";
import { profileLimiter } from "../middlewares/rateLimiter.js";

const Router = express.Router();

Router.get('/me', auth, profileController.getMyProfile);
Router.patch('/me', auth, profileValidations.updateMyProfile, validate, profileLimiter, profileController.updateMyProfile);
Router.delete('/me', auth, profileController.deleteMyProfile);
Router.patch('/me/change-password', auth, profileValidations.updatePassword, validate, profileLimiter, profileController.updatePassword);
Router.patch('/me/change-email', auth, profileValidations.updateEmail, validate, profileLimiter, profileController.updateEmail);
Router.get('/confirm-email', profileController.confirmEmailUpdate);

export default Router;