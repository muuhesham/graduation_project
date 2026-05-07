import { prisma as prismaClient } from '../config/db.js';
import AppError from '../errors/AppError.js';
import { matchPassword } from '../utils/hash.js';
import userService from './userService.js';
import AuthProvider from '../constants/enums/authProvider.js';

const profileService = {
    async getMyProfile({userId}) {
        const user = await userService.getUser(userId);

        if (!user) {
            throw new AppError('User not found', 404);
        }
        
        return user;
    },

    async updateMyProfile({userId, allowedData}) {
        const updatedUser = await prismaClient.user.update({
            where: { id: userId },
            data: allowedData,
            omit: {
                id: true,
                email: true,
                password: true,
                idInProviderDB: true,
                authProvider: true,
                governorateId: true,
                updatedAt: true,
                deletedAt: true,
                role: true,
            },
        });
        return updatedUser;
    },

    async deleteMyProfile({userId, password}) {
        const user = await userService.findUser(userId);
        if (!user) {
            throw new AppError('User not found or already deleted', 404);
        }

        const isPasswordMatch = await matchPassword(password, user.password);
        if (!isPasswordMatch) {
            throw new AppError('Current password is incorrect', 400);
        }

        await userService.softDelete(userId);
    },

    async updateEmail({userId, newEmail}) {
        if (!userId || !newEmail) {
            throw new Error('Missing userId or newEmail for update');
        }
        const updatedEmail = await prismaClient.user.update({
            where: { id: userId },
            data: { email: newEmail, isVerified: false },
            select: { email: true },
        });
         
        return updatedEmail;
    },

    async updatePassword({userId, newPassword}) {
        await prismaClient.user.update({
            where: { id: userId },
            data: { password: newPassword },
        });
    },

    async isPasswordValid({userId, password}) {
        const user = await userService.findUser(userId);
        const isPasswordMatch = matchPassword(password, user.password);
        if (!isPasswordMatch) {
            throw new AppError('Current password is incorrect', 400);
        }
    },

    async checkPassword({userId, oldPassword, newPassword, confirmPassword}){
        if(newPassword !== confirmPassword){
            throw new AppError(`Passwords don't match`, 400);
        }
        const user = await userService.findUser(userId);
         const isPasswordMatch = matchPassword(oldPassword, user.password);
         if (!isPasswordMatch) {
             throw new AppError('Current password is incorrect', 400);
         }
    },

    async checkAuthMethod({userId}){
        const user = await userService.findUser(userId);
        if(user.authProvider !== AuthProvider.LOCAL){
            throw new AppError(`Email or Password can't be changed for google login users`, 400);
        }
    },

};

export default profileService;
