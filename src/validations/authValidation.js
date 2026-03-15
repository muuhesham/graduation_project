import { body } from 'express-validator';
import { createRequire } from 'module';
import emailInspector from 'email-inspector';
import validator from 'validator';
import { CompanyType } from '@prisma/client';

import locationService from './../services/locationService.js';

// For JSON imports in ES modules
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

    registerOrganization: [
        body('name')
            .trim()
            .notEmpty()
            .withMessage('Name cannot be empty')
            .isLength({ max: 100 })
            .withMessage('Name cannot exceed 100 characters'),

        body('contactName')
            .trim()
            .notEmpty()
            .withMessage('Contact name is required')
            .isLength({ max: 100 })
            .withMessage('Contact name cannot exceed 100 characters'),

        body('email')
            .trim()
            .notEmpty()
            .withMessage('Email cannot be empty')
            .normalizeEmail()
            .isEmail()
            .withMessage('Invalid email format')
            .custom((value) => {
                const domain = value.split('@')[1]?.toLowerCase();
                if (disposableDomains.includes(domain)) {
                    throw new Error('Disposable email addresses are not allowed');
                }
                if (!emailInspector.validate(value)) {
                    throw new Error('Invalid company email');
                }
                return true;
            }),

        body('password')
            .notEmpty()
            .withMessage('Password cannot be empty')
            .isLength({ min: 8, max: 100 })
            .withMessage('Password must be between 8 and 100 characters'),

        body('phone')
            .trim()
            .notEmpty()
            .withMessage('Phone number is required')
            .isLength({ min: 6, max: 15 })
            .withMessage('Phone number must be between 6 and 15 digits')
            .isMobilePhone('any')
            .withMessage('Must be a valid phone number'),

        body('categoryId')
            .trim()
            .notEmpty()
            .withMessage('Category is required')
            .toInt()
            .isInt()
            .withMessage('Category id must be a number'),

        body('companyType')
            .trim()
            .notEmpty()
            .withMessage('Company type is required')
            .isIn(Object.values(CompanyType))
            .withMessage('Invalid company type'),

        body('registrationNumber')
            .trim()
            .notEmpty()
            .withMessage('Registration number is required')
            .isLength({ max: 100 })
            .withMessage('Registration number cannot exceed 100 characters'),

        body('taxId')
            .trim()
            .notEmpty()
            .withMessage('Tax ID is required')
            .isLength({ max: 100 })
            .withMessage('Tax ID cannot exceed 100 characters')
            .custom(async (value, { req }) => {
                const countryId = Number(req.body.countryId);

                if (!Number.isInteger(countryId)) {
                    throw new Error('Country is required to validate tax ID');
                }

                const country = await locationService.findCountryById(countryId);

                if (!country) {
                    throw new Error('Invalid country selected for tax ID validation');
                }

                const countryCode = country.taxIdLocale;

                if (!countryCode) {
                    throw new Error('Country code is missing for tax ID validation');
                }

                if (!validator.isTaxID(value, countryCode)) {
                    throw new Error('Invalid tax ID format for the selected country');
                }

                return true;
            }),

        body('address')
            .trim()
            .notEmpty()
            .withMessage('Address is required')
            .isLength({ max: 200 })
            .withMessage('Address cannot exceed 200 characters'),

        body('cityId')
            .trim()
            .notEmpty()
            .withMessage('City is required')
            .toInt()
            .isInt()
            .withMessage('Invalid city selection'),

        body('stateId')
            .trim()
            .notEmpty()
            .withMessage('State is required')
            .toInt()
            .isInt()
            .withMessage('Invalid state selection'),

        body('countryId')
            .trim()
            .notEmpty()
            .withMessage('Country is required')
            .toInt()
            .isInt()
            .withMessage('Invalid country selection'),
    ],

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
