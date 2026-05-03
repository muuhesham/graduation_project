import { body } from 'express-validator';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const disposableDomains = require('disposable-email-domains');

const authValidations = {
    login: [
        body('email')
            .trim()
            .notEmpty()
            .withMessage('Email cannot be empty')
            .isLength({ max: 255 })
            .withMessage('Email cannot be that long')
            .isEmail()
            .withMessage('Invalid email format'),

        body('password')
            .trim()
            .notEmpty()
            .withMessage('Password cannot be empty')
            .isLength({ min: 8 })
            .withMessage('Password must be at least 8 characters long'),
    ],

    register: [
        body('name')
            .trim()
            .notEmpty()
            .withMessage('Name cannot be empty')
            .matches(/^[\p{L}\s\-]+$/u)
            .withMessage('Name can only contain letters, spaces, and hyphens'),

        body('email')
            .trim()
            .notEmpty()
            .withMessage('Email cannot be empty')
            .isLength({ max: 255 })
            .withMessage('Email cannot be that long')
            .isEmail()
            .withMessage('Invalid email format')
            .custom((value) => {
                const domain = value.split('@')[1]?.toLowerCase();
                if (disposableDomains.includes(domain)) {
                    throw new Error('Disposable email addresses are not allowed');
                }
                return true;
            }),

        body('password')
            .trim()
            .notEmpty()
            .withMessage('Password cannot be empty')
            .isStrongPassword({
                minLength: 8,
                minLowercase: 1,
                minUppercase: 0,
                minNumbers: 1,
                minSymbols: 1,
            })
            .withMessage(
                'Password must be at least 8 characters long and include a mix of letters, numbers, and symbols'
            ),
    ],

    verifyOtp: [
        body('otp')
            .trim()
            .notEmpty()
            .withMessage('OTP cannot be empty')
            .isLength({ min: 6, max: 6 })
            .withMessage('OTP must be 6 digits long')
            .isNumeric()
            .withMessage('OTP must contain only numbers'),
    ],
    forgetPassword: [
        body('email')
            .trim()
            .notEmpty()
            .withMessage('Email is required')
            .isEmail()
            .withMessage('Invalid email format'),
    ],
    resetPassword: [
        body('email')
            .trim()
            .notEmpty()
            .withMessage('Email is required')
            .isEmail()
            .withMessage('Invalid email format'),
        body('token').trim().notEmpty().withMessage('Token is required'),
        body('newPassword')
            .trim()
            .notEmpty()
            .withMessage('NewPassword is required')
            .isStrongPassword({
                minLength: 8,
                minLowercase: 1,
                minUppercase: 0,
                minNumbers: 1,
                minSymbols: 1,
            })
            .withMessage(
                'Password must be at least 8 characters long and include a mix of letters, numbers, and symbols'
            ),
    ],
    logout: [body('refreshToken').notEmpty().withMessage('Token is required')],
    refreshToken: [body('refreshToken').notEmpty().withMessage('Token is required')],

    requestPhoneOtp: [
        body('phone')
            .trim()
            .notEmpty()
            .withMessage('Phone number is required')
            .isLength({ min: 6, max: 15 })
            .withMessage('Phone number must be between 6 and 15 digits')
            .isMobilePhone('any')
            .withMessage('Must be a valid phone number'),
    ],

    verifyPhoneOtp: [
        body('phone')
            .trim()
            .exists()
            .withMessage('Phone number is required')
            .isLength({ min: 6, max: 15 })
            .withMessage('Phone number must be between 6 and 15 digits')
            .isMobilePhone('any')
            .withMessage('Must be a valid phone number'),

        body('otp')
            .trim()
            .notEmpty()
            .withMessage('OTP cannot be empty')
            .isLength({ min: 6, max: 6 })
            .withMessage('OTP must be 6 digits long')
            .isNumeric()
            .withMessage('OTP must contain only numbers'),
    ],
};

export default authValidations;
