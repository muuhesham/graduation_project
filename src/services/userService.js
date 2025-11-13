import { prisma as prismaClient } from '../config/db.js';
import { hashPassword } from './../utils/hash.js';

const userService = {
    async create(user) {
        const existingUser = await userService.findByEmail(user.email);
        
        if (existingUser) {
            return {
                status: 'fail',
                data: { error: 'User already registered' },
            };
        }

        user.password = await hashPassword(user.password);
        
        return prismaClient.user.create({
            data: user
        });
    },

     async findByEmail(email) {
        return prismaClient.user.findFirst({
            where: {email}
        });
    },
    
    async isVerified(userId) {
        const user = await prismaClient.user.findFirst({
            where: {
                userId,
                isVerified: true
            },
        });
        return !!user?.isVerified;
    },
    
    async markVerified(email) {
        return prismaClient.user.update({
            where: { email: email },
            data: { isVerified: true },
        });
    },
};

export default userService;
