import { body } from 'express-validator';
import { createRequire } from 'module';
import Gender  from '../constants/enums/userGender.js';
import userRoles  from '../constants/enums/userRoles.js';
import Language  from '../constants/enums/userLanguage.js';

const require = createRequire(import.meta.url);
const disposableDomains = require('disposable-email-domains');

const profileValidations = {
    updateMyProfile: [
        body('name')
            .optional()
            .trim()
            .notEmpty()
            .withMessage('Name cannot be empty')
            .matches(/^[\p{L}\s\-]+$/u)
            .withMessage('Name can only contain letters, spaces, and hyphens'),
        body('phone')
            .optional()
            .trim()
            .notEmpty()
            .withMessage('Phone number cannot be empty')
            .isMobilePhone()
            .withMessage('Invalid phone number format'),
        body('address')
            .optional()
            .trim()
            .notEmpty()
            .withMessage('Address cannot be empty')
            .isLength({ max: 500 })
            .withMessage('Address cannot be that long'),

        body('gender')
            .optional()
            .isIn(Object.values(Gender))
            .withMessage('Gender must be male or female'),

        body('role').optional().isIn(Object.values(userRoles)).withMessage('Role is invalid'),

        body('location')
            .optional()
            .isString()
            .withMessage('Location must be a string')
            .isLength({ max: 100 })
            .withMessage('Location too long'),

        body('languagePreference')
            .optional()
            .isIn(Object.values(Language))
            .withMessage('Language is invalid'),

        body('isVerified').optional().isBoolean().withMessage('isVerified must be a boolean'),

        body('isCompleted').optional().isBoolean().withMessage('isCompleted must be a boolean'),

        body('birthDate')
            .optional()
            .isDate()
            .withMessage('birthDate must be a valid date')
            .custom((value) => {
                if (new Date(value) > new Date()) {
                    throw new Error('birthDate cannot be in the future');
                }
                return true;
            }),
    ],
    updateEmail: [
        body('newEmail')
            .trim()
            .notEmpty()
            .withMessage('New email cannot be empty')
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
        body('confirmEmail')
            .trim()
            .notEmpty()
            .withMessage('Confirm email cannot be empty')
            .isLength({ max: 255 })
            .withMessage('Email cannot be that long')
            .isEmail()
            .withMessage('Invalid email format'),
    ],
    updatePassword: [
        body('oldPassword').trim().notEmpty().withMessage('Current password cannot be empty'),
        body('newPassword')
            .trim()
            .notEmpty()
            .withMessage('New password cannot be empty')
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
        body('confirmPassword')
            .trim()
            .notEmpty()
            .withMessage('Confirm password cannot be empty')
            .isStrongPassword({
                minLength: 8,
            })
            .withMessage(
                'Password must be at least 8 characters long and include a mix of letters, numbers, and symbols'
            ),
    ],
};

export default profileValidations;