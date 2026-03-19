import profileService from '../services/profileService.js';
import asyncHandler from '../middlewares/asyncWrapper.js';
import { sendSuccess } from '../utils/response.js';
import { generateToken, verifyToken } from '../middlewares/auth.js';
import mailService from '../services/mailService.js';
import { hashPassword } from '../utils/hash.js';
import authService from '../services/authService.js';
import cacheService from '../services/cacheService.js';
import userService from '../services/userService.js';
import eventService from '../services/eventService.js';
import categoryService from '../services/categoryService.js';

const profileController = {
    getMyProfile: asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const userData = await profileService.getMyProfile({userId});
        sendSuccess(res, userData, 200);
    }),

    updateMyProfile: asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const { name, phone, gender, location, languagePreference, birthDate } = req.body;
        const allowedData = { name, phone, gender, location, languagePreference, birthDate };
        const updateUser = await profileService.updateMyProfile({userId, allowedData});
        sendSuccess(res, updateUser, 200);
    }),

    deleteMyProfile: asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const { password } = req.body;

        await profileService.deleteMyProfile({userId, password});

        await authService.revokeAllTokensUser({userId});

        if (req.headers.authorization) {
            const accessToken = req.headers.authorization.split(' ')[1];
            const { cacheKey, ttl } = authService.accessTokenCache({ accessToken });
            await cacheService.set(cacheKey, true, ttl);
        }

        //logout
        sendSuccess(res, { message: 'Profile deleted successfully. please login again.' }, 200);
    }),

    updateEmail: asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const { newEmail, confirmEmail, password } = req.body;

        await profileService.isPasswordValid({userId, password});

        await profileService.getMyProfile({userId});

        await userService.isEmailAvailable({newEmail, confirmEmail});

        const token = generateToken({ userId, newEmail }, '15m');
        const user = await userService.findEmailById({userId});
        await mailService.sendUpdateEmail({user, newEmail, token});

        sendSuccess(res, { message: 'Verification email sent successfully' }, 200);
    }),

    confirmEmailUpdate: asyncHandler(async (req, res) => {
        const { token } = req.query;
        const payload = verifyToken(token);
        const { userId, newEmail } = payload;

        const updatedEmail = await profileService.updateEmail({userId, newEmail});
        await authService.sendOtpMail({user: updatedEmail, isFirstTime: false});

        sendSuccess(
            res,
            {
                message: 'Email updated successfully. please verify your new email.',
                email: updatedEmail.email,
            },
            200
        );
    }),

    updatePassword: asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const { oldPassword, newPassword, confirmPassword } = req.body;

        await profileService.getMyProfile({userId});

        await profileService.checkPassword({userId, oldPassword, newPassword, confirmPassword});

        const hashedNewPassword = await hashPassword(newPassword);
        await profileService.updatePassword({userId, newPassword: hashedNewPassword});
        await authService.revokeAllTokensUser({userId});

        if (req.headers.authorization) {
            const accessToken = req.headers.authorization.split(' ')[1];
            const { cacheKey, ttl } = authService.accessTokenCache({ accessToken });
            await cacheService.set(cacheKey, true, ttl);
        }

        //logout 
        sendSuccess(res, { message: 'Password updated successfully. Please login again.' }, 200);
    }),

    getAttendEvents: asyncHandler(async (req, res) => {
        const userId = req.user.id; 
        const count = await eventService.getUserAttendedEvents({ userId });
        sendSuccess(res, { count }, 200);
    }),

    getPreferences: asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const preferences = await categoryService.getPreferences({userId});
        sendSuccess(res, { preferences }, 200);
    }),

    updatePreferences: asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const { categoryIds } = req.body;
        const updatedPreferences = await categoryService.updatePreferences({ userId, categoryIds });
        sendSuccess(res, updatedPreferences, 200);
    }),

};

export default profileController;
