import crypto from 'node:crypto';
import { prisma as prismaClient } from '../config/db.js';
import userService from './userService.js';
import AppError from '../errors/AppError.js';
import smsService from './sms/smsService.js';

const otpService = {
    OTP_EXPIRATION: 10 * 60, // 10 minutes
    generateOtp() {
        return crypto.randomInt(100000, 999999).toString();
    },

    async storeOrUpdateOtp(email, code, expiresIn = otpService.OTP_EXPIRATION) {
        await prismaClient.otp.upsert({
            where: { email },
            update: {
                code,
                isUsed: false,
                expiresAt: new Date(Date.now() + expiresIn * 1000),
            },
            create: {
                email,
                code,
                isUsed: false,
                expiresAt: new Date(Date.now() + expiresIn * 1000),
            },
        });
    },

    async verifyOtp(email, otp) {
        const record = await prismaClient.otp.findUnique({ where: { email } });

        if (!record || record.code !== otp) {
            return {
                status: 'fail',
                data: { otp: 'Invalid OTP' },
            };
        }

        if (record.isUsed || new Date() > record.expiresAt) {
            return {
                status: 'fail',
                data: { otp: 'OTP expired' },
            };
        }

        await userService.markVerified(email);
        return {
            status: 'success',
            data: { message: 'Email verified successfully' },
        };
    },

    async markUsed(email) {
        await prismaClient.otp.update({
            where: { email },
            data: { isUsed: true },
        });
    },

    async deleteOtp(email) {
        await prismaClient.otp.delete({
            where: { email },
        });
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

    async verifyPhoneOtp(phone, otp) {
        const record = await prismaClient.phoneOtp.findUnique({ where: { phone } });

        if (!record || record.code !== otp) {
            throw new AppError('Invalid OTP', 400, 'INVALID_OTP');
        }

        if (record.isUsed) {
            throw new AppError('OTP already used', 400, 'OTP_USED');
        }

        if (new Date() > record.expiresAt) {
            throw new AppError('OTP expired', 400, 'OTP_EXPIRED');
        }

        await otpService.markPhoneUsed(phone);
        return true;
    },

    async markPhoneUsed(phone) {
        await prismaClient.phoneOtp.update({
            where: { phone },
            data: { isUsed: true },
        });
    },

    async requestPhoneOtp({
        phone,
        templateName,
        variables = {},
        expiresInSeconds = otpService.OTP_EXPIRATION,
    }) {
        const otp = otpService.generateOtp();
        await otpService.storeOrUpdatePhoneOtp(phone, otp, expiresInSeconds);

        const expiresInMinutes = Math.ceil(expiresInSeconds / 60);
        await smsService.sendQueuedTemplate({
            to: phone,
            templateName,
            variables: {
                ...variables,
                otp,
                expiresInMinutes,
            },
        });

        return {
            otp,
            expiresAt: new Date(Date.now() + expiresInSeconds * 1000),
        };
    },
};

export default otpService;
