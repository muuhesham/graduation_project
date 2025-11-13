import authService from "../services/authService.js";
import { sendSuccess, sendFail, sendError } from "../utils/response.js";
import { google } from "googleapis";
import jwt from "jsonwebtoken";
import { prisma } from "../config/db.js";
import {
  CALLBACK_URL,
  CLIENT_ID,
  CLIENT_SECRET,
  HOSTNAME,
  PORT,
} from "../config/env.js";

export const authController = {
  async register(req, res) {
    try {
      const { name, email, password, role } = req.body;

      const result = await authService.register({
        name,
        email,
        password,
        role,
      });

      if (result.status === "fail") {
        return sendFail(res, result.data, 400);
      }

      return sendSuccess(res, { token: result.token }, 201);
    } catch (err) {
      console.error(err);
      return sendError(
        res,
        "Internal server error",
        "INTERNAL_ERROR",
        null,
        500
      );
    }
  },

  async verifyOtp(req, res) {
    try {
      const user = req.user;
      const { otp } = req.body;

      const result = await authService.verifyOtp(user, otp);

      if (result.status === "fail") {
        return sendFail(res, result.data, 400);
      }

      return sendSuccess(res, result.data, 200);
    } catch (err) {
      console.error(err);
      return sendError(
        res,
        "Internal server error",
        "INTERNAL_ERROR",
        null,
        500
      );
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;

      const result = await authService.login({ email, password });

      if (result.status === "fail") {
        return sendFail(res, result.data, 400);
      }

      return sendSuccess(res, result, 200);
    } catch (err) {
      console.error(err);
      return sendError(
        res,
        "Internal server error",
        "INTERNAL_ERROR",
        null,
        500
      );
    }
  },

  async resendOtp(req, res) {
    try {
      const user = req.user;

      const result = await authService.sendOtpMail(user, false);

      if (result.status === "fail") {
        return sendFail(res, result.data, 400);
      }

      return sendSuccess(res, result.data, 200);
    } catch (err) {
      console.error(err);
      return sendError(
        res,
        "Internal server error",
        "INTERNAL_ERROR",
        null,
        500
      );
    }
  },
};

class AuthThirdPartyController {
  async createOrFetchUser(email, name, provider, providerId) {
    let user = await prisma.user.findUnique({
      where: { email },
      include: { attendee: true },
    });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          role: "ATTENDEE",
          isVerified: true,
          attendee: {
            create: {
              authProvider: provider,
              providerId: providerId,
            },
          },
        },
        include: { attendee: true },
      });
    }
    return user;
  }

  generateJwt(user) {
    return authService.generateToken(user);
  }
}

class GoogleAuthController extends AuthThirdPartyController {
  constructor() {
    super();
    this.oauth2Client = new google.auth.OAuth2(
      CLIENT_ID,
      CLIENT_SECRET,
      "http://" + HOSTNAME + ":" + PORT + CALLBACK_URL
    );
  }

  getAuthUrl = async (req, res) => {
    try {
      const url = this.oauth2Client.generateAuthUrl({
        access_type: "offline",
        prompt: "consent",
        scope: ["profile", "email"],
      });
      return sendSuccess(res, { url });
    } catch (err) {
      return sendError(
        res,
        "Failed to generate Google auth URL",
        "OAUTH2_URL_ERROR",
        null,
        500
      );
    }
  };

  handleCallback = async (req, res) => {
    const code = req.query.code;
    if (!code) {
      return sendFail(res, { error: "Missing code" });
    }

    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      const { id_token } = tokens;

      const decoded = jwt.decode(id_token);
      if (!decoded)
        return sendFail(res, { error: "Failed to decode user info" });

      const { email, name, sub: providerId } = decoded;
      const user = await this.createOrFetchUser(
        email,
        name,
        "GOOGLE",
        providerId
      );

      if (!user) {
        return sendError(
          res,
          "Failed to create or fetch user",
          "USER_FETCH_ERROR",
          null,
          500
        );
      }

      // what do you think of making this: super.generateJwt(user);
      const token = this.generateJwt(user);

      return sendSuccess(
        res,
        {
          message: "Attendee authenticated successfully",
          token,
          data: { user },
        },
        201
      );
    } catch (error) {
      console.error(error);
      return sendError(
        res,
        "Google OAuth2 authentication failed",
        "OAUTH2_ERROR",
        null,
        500
      );
    }
  };
}

export const googleAuthController = new GoogleAuthController();
