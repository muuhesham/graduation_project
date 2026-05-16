import crypto from 'node:crypto';
import { prisma as prismaClient } from '../config/db.js';

import userService from './userService.js';
import smsService from './sms/smsService.js';
import AppError from '../errors/AppError.js';

import BadRequestError from '../errors/BadRequestError.js';
import OtpErrors from './../constants/messages/errors/otp.js';
import { otpRepository, phoneOtpRepository } from './../repositories/index.js';

/**
 * @typedef {import('./../types/shared').TransactionClient} TransactionClient
 * @typedef {import('./../types/models').Otp} Otp
 * @typedef {import('./../types/models').PhoneOtp} PhoneOtp
 */

const otpService = {
    OTP_EXPIRATION: 10 * 60, // 10 minutes
    generateOtp() {
        return crypto.randomInt(100000, 999999).toString();
    },

    /**
     * @deprecated Use storeOrUpdatePhoneOtpRecord instead
     */
    async storeOrUpdatePhoneOtp(phone, code, expiresIn = otpService.OTP_EXPIRATION) {
        await prismaClient.phoneOtp.upsert({
            where: { phone },
            update: {
                code,
                isUsed: false,
                expiresAt: new Date(Date.now() + (expiresIn * 1000)),
            },
            create: {
                phone,
                code,
                isUsed: false,
                expiresAt: new Date(Date.now() + (expiresIn * 1000)),
            },
        });
    },

    /**
     * @param {string} email
     * @param {string} code
     * @param {number} [expiresIn]
     * @param {TransactionClient | null} [tx]
     * @returns {Promise<Otp>}
     */
    storeOrUpdateEmailOtpRecord(email, code, expiresIn = otpService.OTP_EXPIRATION, tx = null) {
        const data = {
            email,
            code,
            isUsed: false,
            expiresAt: new Date(Date.now() + expiresIn * 1000),
        };

        return otpRepository.upsert({
            where: { email },
            create: data,
            update: data,
        }, tx);
    },

    /**
     * @param {string} phone
     * @param {string} code
     * @param {number} [expiresIn]
     * @param {TransactionClient | null} [tx]
     * @returns {Promise<PhoneOtp>}
     */
    storeOrUpdatePhoneOtpRecord(phone, code, expiresIn = otpService.OTP_EXPIRATION, tx = null) {
        const data = {
            phone,
            code,
            isUsed: false,
            expiresAt: new Date(Date.now() + expiresIn * 1000),
        };

        return phoneOtpRepository.upsert({
            where: { phone },
            create: data,
            update: data,
        }, tx);
    },

    /**
     * @deprecated Use storeOrUpdateEmailOtpRecord instead
     */
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

    /**
     * @deprecated Use verifyEmailOtpRecord instead
     */
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

    /**
     * @param {string} email
     * @param {string} otp
     * @param {TransactionClient | null} [tx]
     * @returns {Promise<void>}
     */
    async verifyEmailOtpRecord(email, otp, tx = null) {
        const record = await otpRepository.findOne({ where: { email } }, tx);

        if (!record || record.code !== otp) {
            throw new BadRequestError(OtpErrors.INVALID_OTP.message, OtpErrors.INVALID_OTP.code);
        }

        if (record.isUsed || new Date() > record.expiresAt) {
            throw new BadRequestError(OtpErrors.EXPIRED_OTP.message, OtpErrors.EXPIRED_OTP.code);
        }

        await otpRepository.delete({ where: { email } }, tx);
    },

    /**
     * @param {string} phone
     * @param {string} otp
     * @param {TransactionClient | null} [tx]
     * @returns {Promise<void>}
     */
    async verifyPhoneOtpRecord(phone, otp, tx = null) {
        const record = await phoneOtpRepository.findOne({ where: { phone } }, tx);

        if (!record || record.code !== otp) {
            throw new BadRequestError(OtpErrors.INVALID_OTP.message, OtpErrors.INVALID_OTP.code);
        }

        if (record.isUsed || new Date() > record.expiresAt) {
            throw new BadRequestError(OtpErrors.EXPIRED_OTP.message, OtpErrors.EXPIRED_OTP.code);
        }

        await phoneOtpRepository.delete({ where: { phone } }, tx);
    },

    /**
     * @param {string} email
     * @param {TransactionClient | null} [tx]
     * @returns {Promise<string>}
     */
    async requestEmailOtpRecord(email, tx = null) {
        const code = this.generateOtp();
        await this.storeOrUpdateEmailOtpRecord(email, code, otpService.OTP_EXPIRATION, tx);
        return code;
    },

    /**
     * @param {string} phone
     * @param {number} [expiresInSeconds]
     * @param {TransactionClient | null} [tx]
     * @returns {Promise<string>}
     */
    async requestPhoneOtpRecord(phone, expiresInSeconds = otpService.OTP_EXPIRATION, tx = null) {
        const code = this.generateOtp();

        await this.storeOrUpdatePhoneOtpRecord(phone, code, expiresInSeconds, tx);
        
        await smsService.sendQueuedMessage({
            to: phone,
            body: `Your verification code is: ${code}. This code will expire in ${Math.floor(expiresInSeconds / 60)} minutes.`,
        });

        return code;
    },

    /**
     * @deprecated Use requestPhoneOtpRecord instead
     */
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

    /**
     * @deprecated Use verifyPhoneOtpRecord instead
     */
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
    
    /**
     * @deprecated Use markEmailOtpUsedRecord instead
     */
    async markUsed(email) {
        await prismaClient.otp.update({
            where: { email },
            data: { isUsed: true },
        });
    },

    /**
     * @param {string} email
     * @param {TransactionClient | null} [tx]
     */
    markEmailOtpUsedRecord(email, tx = null) {
        return otpRepository.update({
            where: { email },
            data: { isUsed: true },
        }, tx);
    },

    /**
     * @deprecated Use deleteEmailOtpRecord instead
     */
    async deleteOtp(email) {
        await prismaClient.otp.delete({
            where: { email },
        });
    },

    /**
     * @param {string} email
     * @param {TransactionClient | null} [tx]
     */
    deleteEmailOtpRecord(email, tx = null) {
        return otpRepository.delete({
            where: { email },
        }, tx);
    },

    /**
     * @param {string} phone
     * @param {TransactionClient | null} [tx]
     */
    deletePhoneOtpRecord(phone, tx = null) {
        return phoneOtpRepository.delete({
            where: { phone },
        }, tx);
    },
};

export default otpService;
