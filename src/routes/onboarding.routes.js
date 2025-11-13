import express from "express";
import {
  onboardingWriteLimiter,
  statusLimiter,
} from "../middlewares/rateLimiter.js";
import { onboardingController } from "../controllers/onboardingController.js";
import validate from "../middlewares/validate.js";
import auth from "../middlewares/auth.js";
import { body } from "express-validator";
import onboardingValidations from "../validations/onboardingValidation.js";

const Router = express.Router();

Router.get("/status", statusLimiter, auth, onboardingController.getStatus);

Router.post(
  "/basic",
  onboardingWriteLimiter,
  auth,
  onboardingValidations.updateBasic,
  validate,
  onboardingController.updateBasic
);

Router.post(
  "/preferences",
  onboardingWriteLimiter,
  auth,
  onboardingValidations.updatePreferences,
  validate,
  onboardingController.updatePreferences
);

Router.post(
  "/location",
  onboardingWriteLimiter,
  auth,
  onboardingValidations.updateLocation,
  validate,
  onboardingController.updateLocation
);

export default Router;
