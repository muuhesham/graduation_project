import authService from '../services/authService.js';
import userService from '../services/userService.js';
import adminService from '../services/adminService.js';
import { sendSuccess, sendFail, sendError } from '../utils/response.js';
import {
    CALLBACK_URL,
    CLIENT_ID,
    CLIENT_SECRET,
    HOSTNAME,
    PORT,
    GOOGLE_REDIRECT_URL,
} from '../config/env.js';
import { google } from 'googleapis';
import { AuthThirdPartyService } from '../services/thirdPartyAuthService.js';

class GoogleAuthController extends AuthThirdPartyService {
    constructor() {
        super();
        this.oauth2Client = new google.auth.OAuth2(
            CLIENT_ID,
            CLIENT_SECRET,
            'http://' + 'localhost' + ':' + (PORT || 3000) + CALLBACK_URL
        );
    }

    getAuthUrl = async (req, res) => {
        try {
            const url = this.oauth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: ['profile', 'email'],
            });
            return sendSuccess(res, { url });
        } catch (err) {
            console.error(err);
            return sendError(res, 'Failed to generate Auth URL', 'AUTH_URL_ERROR', null, 500);
        }
    };

    handleCallback = async (req, res) => {
        try {
            const { code } = req.query;
            const { tokens } = await this.oauth2Client.getToken(code);
            this.oauth2Client.setCredentials(tokens);

            const oauth2 = google.oauth2({
                auth: this.oauth2Client,
                version: 'v2',
            });

            const userInfo = await oauth2.userinfo.get();

            const user = await this.createOrFetchUser(
                userInfo.data.email,
                userInfo.data.name,
                'GOOGLE',
                userInfo.data.id
            );

            const result = await this.generateJwt(user);

            return sendSuccess(res, result);
        } catch (error) {
            console.error(error);
            return sendError(res, 'Google OAuth2 authentication failed', 'OAUTH2_ERROR', null, 500);
        }
    };
}

const authController = {
    async register(req, res) {
        try {
            const { name, email, password } = req.body;
            const result = await authService.register({ name, email, password });

            if (result.status === 'fail') {
                return sendFail(res, result.data);
            }

            return sendSuccess(res, result.data, 201);
        } catch (error) {
            console.error(error);
            return sendError(res, 'Registration failed', 'REGISTRATION_ERROR', null, 500);
        }
    },

    async login(req, res) {
        try {
            const { email, password } = req.body;
            const result = await authService.login({ email, password });

            if (result.status === 'fail') {
                return sendFail(res, result.data);
            }

            return sendSuccess(res, result.data);
        } catch (error) {
            console.error(error);
            return sendError(res, 'Login failed', 'LOGIN_ERROR', null, 500);
        }
    },

    async refreshToken(req, res) {
        try {
            const { refreshToken } = req.body;
            const result = await authService.refreshToken({ refreshToken });

            if (result.status === 'fail') {
                return sendFail(res, result.data, 401);
            }

            return sendSuccess(res, result.data);
        } catch (error) {
            console.error(error);
            return sendError(res, 'Token refresh failed', 'REFRESH_ERROR', null, 500);
        }
    },

    async logout(req, res) {
        try {
            const { refreshToken } = req.body;
            const accessToken = req.headers.authorization?.split(' ')[1];
            const user = req.user;

            const result = await authService.logout({ user, accessToken, refreshToken });

            if (result.status === 'fail') {
                return sendFail(res, result.data, 401);
            }

            return sendSuccess(res, result.data);
        } catch (error) {
            console.error(error);
            return sendError(res, 'Logout failed', 'LOGOUT_ERROR', null, 500);
        }
    },

    async requestResetPassword(req, res) {
        try {
            const { email } = req.body;
            const result = await authService.requestResetPassword({ email });

            return sendSuccess(res, result.data);
        } catch (error) {
            console.error(error);
            return sendError(res, 'Password reset request failed', 'RESET_ERROR', null, 500);
        }
    },

    async resetPassword(req, res) {
        try {
            const { email, token, newPassword } = req.body;
            const result = await authService.resetPassword({ email, token, newPassword });

            if (result.status === 'fail') {
                return sendFail(res, result.data);
            }

            return sendSuccess(res, result.data);
        } catch (error) {
            console.error(error);
            return sendError(res, 'Password reset failed', 'RESET_ERROR', null, 500);
        }
    },

    async resendOtp(req, res) {
        try {
            const user = req.user;
            const result = await authService.sendOtpMail({ user, isFirstTime: false });

            if (result.status === 'fail') {
                return sendFail(res, result.data);
            }

            return sendSuccess(res, result.data);
        } catch (error) {
            console.error(error);
            return sendError(res, 'OTP sending failed', 'OTP_ERROR', null, 500);
        }
    },

    async verifyOtp(req, res) {
        try {
            const { otp } = req.body;
            const user = req.user;

            const result = await authService.verifyOtp(user, otp);

            if (result.status === 'fail') {
                return sendFail(res, result.data);
            }

            return sendSuccess(res, result.data);
        } catch (error) {
            console.error(error);
            return sendError(res, 'OTP verification failed', 'OTP_ERROR', null, 500);
        }
    },

    async requestPhoneOtp(req, res, next) {
        try {
            const userId = req.user?.id;
            const { phone } = req.body;
            await authService.requestPhoneOtp({ userId, phone });
            return sendSuccess(res, {}, 200);
        } catch (err) {
            return next(err);
        }
    },

    async verifyPhoneOtp(req, res, next) {
        try {
            const userId = req.user?.id;
            const { phone, otp } = req.body;
            await authService.verifyPhoneOtp({ userId, phone, otp });
            return sendSuccess(res, {}, 200);
        } catch (err) {
            return next(err);
        }
    },
};

export default authController;
export const googleAuthController = new GoogleAuthController();
