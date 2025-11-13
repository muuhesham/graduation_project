import express from "express";
import { authController } from "../controllers/authController.js";
import { googleAuthController } from "../controllers/authController.js";
import authValidations from "../validations/authValidation.js";
import validate from "../middlewares/validate.js";
import auth from "../middlewares/auth.js";
import { authLimiter, emailLimiter } from "../middlewares/rateLimiter.js";

const Router = express.Router();

Router.post(
  "/register",
  authLimiter,
  authValidations.register,
  validate,
  authController.register
);

Router.post(
  "/verify-otp",
  authLimiter,
  auth,
  authValidations.verifyOtp,
  validate,
  authController.verifyOtp
);

Router.post("/resend-otp", emailLimiter, auth, authController.resendOtp);

Router.post(
  "/login",
  authLimiter,
  authValidations.login,
  validate,
  authController.login
);

Router.get("/google/url", authLimiter, googleAuthController.getAuthUrl);

Router.get(
  "/google/callback",
  authLimiter,
  googleAuthController.handleCallback
);

export default Router;
