import { prisma as prismaClient } from '../config/db.js';

const profileService = {
    async getMyProfile(userId) {
        const user = await prismaClient.user.findFirst({
            where: { id: userId },
            omit: {
                id: true,
                password: true,
                idInProviderDB: true,
                governorateId: true,
                updatedAt: true,
                deletedAt: true,
            },
        });
        return user;
    },

    async updateMyProfile(userId, allowedData) {
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

    // // Hard delete
    // async deleteMyProfile(userId) {
    //     const deletedUser = await prismaClient.user.delete({
    //         where: {id: userId,},
    //     });
    //     return deletedUser;
    // },

    // Soft delete
    async deleteMyProfile(userId) {
        const user = await prismaClient.user.findFirst({
            where: { id: userId},
        });
        if(!user) {return null;}
        await prismaClient.user.updateMany({
            where: { id: userId },
            data: { deletedAt: new Date() },
        });
        return user;
    },
    async updateEmail(userId, newEmail) {
          if (!userId || !newEmail) {
              throw new Error('Missing userId or newEmail for update');
          }
        const updatedEmail = await prismaClient.user.update({
            where: { id: userId },
            data: { email: newEmail },
            select: { email: true },
        });
        return updatedEmail;
    },
    async updatePassword(userId, newPassword) {
        await prismaClient.user.update({
            where: { id: userId },
            data: { password: newPassword },
        });
    },

    async findCurrentEmail(email) {
        const user = await prismaClient.user.findUnique({
            where: { email },
            select: { email: true },
        });
        return user;
    },

    async findEmailById(userId) {
        const user = await prismaClient.user.findUnique({
            where: { id: userId },
            select: { email: true, name: true },
        });
        return user;
    },

    async findCurrentPassword(userId) {
        const user = await prismaClient.user.findUnique({
            where: { id: userId },
            select: { password: true },
        });
        return user;
    }
};

export default profileService;

