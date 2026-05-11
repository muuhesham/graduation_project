import { body, query } from 'express-validator';
import { createRequire } from 'module';
import Gender from '../constants/enums/userGender.js';
import Language from '../constants/enums/userLanguage.js';
import { calculateAge } from '../utils/calculateAge.js';
import GovernoratesNames from '../constants/enums/governoratesNames.js';

const require = createRequire(import.meta.url);
const disposableDomains = require('disposable-email-domains');

const profileValidations = {
    updateMyProfile: [
        body().custom((value, { req }) => {
            const allowedFields = [
                'name',
                'phone',
                'gender',
                'location',
                'languagePreference',
                'birthDate',
                'governorate',
            ];
            const updates = Object.keys(req.body);
            const invalidFields = updates.filter((field) => {
                return !allowedFields.includes(field);
            });

            if (updates.length === 0) {
                throw new Error('Please provide at least one field to update');
            }
            if (invalidFields.length > 0) {
                throw new Error(`Fields [${invalidFields.join(', ')}] are not allowed`);
            }
            return true;
        }),

        body('name')
            .optional()
            .trim()
            .notEmpty()
            .withMessage('Name cannot be empty')
            .matches(/^[\p{L}\s\-]+$/u)
            .withMessage('Name can only contain letters, spaces, and hyphens')
            .isLength({ max: 25 })
            .withMessage('Name cannot be that long'),

        body('phone')
            .optional()
            .trim()
            .isLength({ min: 11 })
            .withMessage('Phone number must be at least 11 characters long')
            .notEmpty()
            .withMessage('Phone number cannot be empty')
            .isMobilePhone()
            .withMessage('Invalid phone number format'),

        body('gender')
            .optional()
            .isIn(Object.values(Gender))
            .withMessage('Gender must be male or female'),

        body('location')
            .optional()
            .trim()
            .isString()
            .isLength({ max: 500 })
            .withMessage('Location must be valid string'),

        body('languagePreference')
            .optional()
            .isIn(Object.values(Language))
            .withMessage('Language is invalid'),

        body('birthDate')
            .optional()
            .isISO8601()
            .withMessage('birthDate must be a valid date')
            .custom((value) => {
                const age = calculateAge(value);
                if (age < 18) {
                    throw new Error('birthDate must be 18 years or older');
                }
                if (new Date(value) > new Date()) {
                    throw new Error('birthDate cannot be in the future');
                }
                return true;
            }),

        body('governorate')
            .optional()
            .trim()
            .toUpperCase()
            .notEmpty()
            .withMessage('Governorate cannot be empty')
            .isIn(Object.values(GovernoratesNames))
            .withMessage('Invalid governorate'),
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
        
        body('password')
            .trim()
            .notEmpty()
            .withMessage('Password cannot be empty'),
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

    confirmEmail: [query('token').notEmpty().withMessage('Token is required')],

    updatePreferences: [
        body().custom((value, { req }) => {
            if (Object.keys(req.body).length === 0) {
                throw new Error('Please provide at least one field to update');
            }
            return true;
        }),
        body('categoryIds')
            .exists()
            .withMessage('categoryIds field is required')
            .isArray({ min: 1 })
            .withMessage('Preferences must be an array with at least one category'),
        body('categoryIds.*').isInt().withMessage('Each category ID must be an integer'),
    ],
};

export default profileValidations;
