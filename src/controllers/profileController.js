import profileService from '../services/profileService.js';
import asyncHandler from '../middlewares/asyncWrapper.js';
import { sendSuccess, sendFail } from '../utils/response.js';
import { generateToken, verifyToken } from '../middlewares/auth.js';
import mailService from '../services/mailService.js';
import { hashPassword, matchPassword } from '../utils/hash.js';
import authService from '../services/authService.js';
import cacheService from '../services/cacheService.js';

const profileController = {
    getMyProfile: asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const userData = await profileService.getMyProfile(userId);

        if (!userData) {
            return sendFail(res, 'User not found', 404);
        }
        sendSuccess(res, userData, 200);
    }),

    updateMyProfile: asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const updatedData = req.body;
        if(!updatedData){
            return sendFail(res, 'No data provided for update', 400);
        }
        const {
            email,
            password,
            role,
            idInProviderDB,
            authProvider,
            governorateId,
            updatedAt,
            deletedAt,
            ...allowedData
        } = updatedData;

        const updateUser = await profileService.updateMyProfile(userId, allowedData);
        sendSuccess(res, updateUser, 200);
    }),

    deleteMyProfile: asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const deletedUser = await profileService.deleteMyProfile(userId);
        if (!deletedUser) {
            return sendFail(res, 'User not found or already deleted', 404);
        }
        sendSuccess(res, { message: 'Profile deleted successfully' }, 200);
    }),

    updateEmail: asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const { newEmail, confirmEmail } = req.body;

        const userData = await profileService.getMyProfile(userId);
        if (!userData) {
            return sendFail(res, 'User not found', 404);
        }

        if(userData.authProvider !== 'LOCAL') {
            return sendFail(res, `Email can't be changed for google login users`, 400);
        }

        const existing = await profileService.findCurrentEmail(newEmail);
        if (existing) return sendFail(res, 'Unable to process your request', 400);

        if (newEmail !== confirmEmail) {
            return sendFail(res, `Emails don't match`, 400);
        }

        const token = generateToken({ userId, newEmail }, '15m');

        const user = await profileService.findEmailById(userId);

        await mailService.sendUpdateEmail(user, newEmail, token);

        sendSuccess(res, { message: 'Verification email sent successfully' }, 200);
    }),

    confirmEmailUpdate: asyncHandler(async (req, res) => {
        const { token } = req.query;

        if (!token) {
            return sendFail(res, 'Token is required', 400);
        }

        const payload = verifyToken(token);

        if(!payload.userId || !payload.newEmail) {
            return sendFail(res, 'Invalid token payload', 400);
        }
        
        const updatedEmail = await profileService.updateEmail(payload.userId, payload.newEmail);

        sendSuccess(
            res,
            {
                message: 'Email updated successfully',
                email: updatedEmail.email,
            },
            200
        );
    }),

    updatePassword: asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const { oldPassword, newPassword, confirmPassword } = req.body;

        const userData = await profileService.getMyProfile(userId);
        if(userData.authProvider !== 'LOCAL') {
             const hashedNewPassword = await hashPassword(newPassword);
             await profileService.updatePassword(userId, hashedNewPassword);
             return sendSuccess(
                 res,
                 { message: 'Password set successfully. You can now login with password.' },
                 200
             );
        }

        const currentPassword = await profileService.findCurrentPassword(userId);
        const comparePassword = await matchPassword(oldPassword, currentPassword.password);

        if (!comparePassword) {
            return sendFail(res, 'Current password is incorrect', 400);
        }

        if (newPassword !== confirmPassword) {
            return sendFail(res, `Passwords don't match`, 400);
        }

        const hashedNewPassword = await hashPassword(newPassword);

        await profileService.updatePassword(userId, hashedNewPassword);
        await authService.deleteTokensForUser(userId);

        if (req.headers.authorization) {
            const accessToken = req.headers.authorization.split(' ')[1];
            const { cacheKey, ttl } = authService.accessTokenCache({ accessToken });
            await cacheService.set(cacheKey, true, ttl);
        }

        //logout 
        sendSuccess(res, { message: 'Password updated successfully. Please login again.' }, 200);
    }),
};

export default profileController;
