import crypto from 'node:crypto';
import { prisma as prismaClient } from '../config/db.js';
import userService from './userService.js';
import smsService from './sms/smsService.js';
import AppError from '../errors/AppError.js';

const otpService = {
    OTP_EXPIRATION: 10 * 60, // 10 minutes
    generateOtp() {
        return crypto.randomInt(100000, 999999).toString();
    },

    async storeOrUpdatePhoneOtp(phone, code, expiresIn = otpService.OTP_EXPIRATION) {
        await prismaClient.phoneOtp.upsert({
            where: { phone },
            update: {
                code,
                isUsed: false,
                expiresAt: new Date(Date.now() + expiresIn * 1000),
            },
            create: {
                phone,
                code,
                isUsed: false,
                expiresAt: new Date(Date.now() + expiresIn * 1000),
            },
        });
    },

    async storeOrUpdateOtp(email, code, expiresIn = otpService.OTP_EXPIRATION) {
        await prismaClient.otp.upsert({
            where: { email },
            update: {
                code,
                isUsed: false,
                expiresAt: new Date(Date.now() + (expiresIn * 1000)),
            },
            create: {
                email,
                code,
                isUsed: false,
                expiresAt: new Date(Date.now() + (expiresIn * 1000)),
            },
        });
    },

    async verifyOtp(email, otp) {
        const record = await prismaClient.otp.findUnique({ where: { email } });
        
        if (!record || record.code !== otp) {
            return { 
                status: 'fail', 
                data: { 'otp': 'Invalid OTP' }
            };
        }
        
        if (record.isUsed || new Date() > record.expiresAt) {
            return { 
                status: 'fail',
                data: { 'otp': 'OTP expired' }
            };
        }

        await userService.markVerified(email);
        return { 
            status: 'success', 
            data: { message: 'Email verified successfully' }
        };
    },

    async verifyEmailOtp(email, otp) {
        const record = await prismaClient.otp.findUnique({ where: { email } });

        if (!record || record.code !== otp) {
            throw new AppError('Invalid OTP', 400, 'OTP_INVALID');
        }

        if (record.isUsed || new Date() > record.expiresAt) {
            throw new AppError('OTP expired', 400, 'OTP_EXPIRED');
        }

        await otpService.deleteOtp(email);
    },

    async requestPhoneOtp({ phone, expiresInSeconds = otpService.OTP_EXPIRATION }) {
        const code = otpService.generateOtp();

        await Promise.all([
            otpService.storeOrUpdatePhoneOtp(phone, code, expiresInSeconds),
            smsService.sendQueuedMessage({
                to: phone,
                body: `Your verification code is: ${code}. This code will expire in ${Math.floor(expiresInSeconds / 60)} minutes.`,
            }),
        ]);

        return { code };
    },

    async verifyPhoneOtp(phone, otp) {
        const record = await prismaClient.phoneOtp.findUnique({ where: { phone } });

        if (!record || record.code !== otp) {
            throw new AppError('Invalid OTP', 400, 'OTP_INVALID');
        }

        if (record.isUsed || new Date() > record.expiresAt) {
            throw new AppError('OTP expired', 400, 'OTP_EXPIRED');
        }

        await prismaClient.phoneOtp.delete({ where: { phone } });
    },
    
    async markUsed(email) {
        await prismaClient.otp.update({
            where: { email },
            data: { isUsed: true },
        });
    },

    async deleteOtp(email) {
        await prismaClient.otp.delete({
            where: {email},
        })
    }
};

export default otpService;