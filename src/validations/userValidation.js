import { body } from 'express-validator';
import organizerTypes from './../constants/enums/organizerTypes.js';

class UserValidation {
    /** @typedef {import('./../types/dtos').UpgradeToOrganizerDTO} */
    upgradeToOrganizer = [
        body('organizerType')
            .notEmpty()
            .withMessage('Organizer type is required')
            .trim()
            .toUpperCase()
            .isIn(Object.values(organizerTypes))
            .withMessage(
                `Organizer type must be one of ${Object.values(organizerTypes).join(', ')}`
            ),

        body('name')
            .trim()
            .notEmpty()
            .withMessage('Name is required')
            .isLength({ max: 150 })
            .withMessage('Name cannot exceed 150 characters'),

        body('description').optional().trim().isString(),
        body('website').optional().trim().isString(),
        body('contactPersonName').optional().trim().isString(),
        body('instagramUrl')
            .optional()
            .trim()
            .isString()
            .custom((val) => this.isValidUrl(val, 'Instagram URL')),
        body('facebookUrl')
            .optional()
            .trim()
            .isString()
            .isURL({
                protocols: ['http', 'https'],
                require_protocol: true,
                host_whitelist: ['facebook.com', 'www.facebook.com', 'm.facebook.com'],
            })
            .withMessage('Facebook URL must be a valid Facebook link'),

        body('twitterUrl')
            .optional()
            .trim()
            .isString()
            .isURL({
                protocols: ['http', 'https'],
                require_protocol: true,
                host_whitelist: ['twitter.com', 'www.twitter.com', 'mobile.twitter.com'],
            })
            .withMessage('Twitter URL must be a valid Twitter link'),

        body('linkedinUrl')
            .optional()
            .trim()
            .isString()
            .isURL({
                protocols: ['http', 'https'],
                require_protocol: true,
                host_whitelist: ['linkedin.com', 'www.linkedin.com'],
            })
            .withMessage('LinkedIn URL must be a valid LinkedIn link'),

        body('youtubeUrl')
            .optional()
            .trim()
            .isString()
            .isURL({
                protocols: ['http', 'https'],
                require_protocol: true,
                host_whitelist: ['youtube.com', 'www.youtube.com', 'm.youtube.com'],
            })
            .withMessage('YouTube URL must be a valid YouTube link'),

        body('website')
            .optional()
            .trim()
            .isString()
            .isURL({
                protocols: ['http', 'https'],
                require_protocol: true,
            })
            .withMessage('Website must be a valid URL'),

        body('address').optional().trim().isString(),
        body('countryId')
            .notEmpty()
            .withMessage('countryId is required')
            .bail()
            .toInt()
            .isInt({ min: 1 })
            .withMessage('countryId must be a valid integer'),
        body('cityId')
            .notEmpty()
            .withMessage('cityId is required')
            .bail()
            .toInt()
            .isInt({ min: 1 })
            .withMessage('cityId must be a valid integer'),
        body('stateId')
            .notEmpty()
            .withMessage('stateId is required')
            .bail()
            .toInt()
            .isInt({ min: 1 })
            .withMessage('stateId must be a valid integer'),

        body('nationalId')
            .if(body('organizerType').equals(organizerTypes.HOBBYIST))
            .notEmpty()
            .withMessage('nationalId is required for hobbyist organizers')
            .trim()
            .isString(),

        body('ownerName')
            .if(body('organizerType').equals(organizerTypes.BUSINESS))
            .notEmpty()
            .withMessage('ownerName is required for business organizers')
            .trim()
            .isString(),

        body('commercialRegistration')
            .if(body('organizerType').equals(organizerTypes.BUSINESS))
            .notEmpty()
            .withMessage('commercialRegistration is required for business organizers')
            .trim()
            .isString(),

        body('contactEmail')
            .notEmpty()
            .withMessage('contactEmail is required')
            .trim()
            .isEmail()
            .withMessage('contactEmail must be a valid email address')
            .custom((value, { req }) => {
                if (req.body.organizerType !== organizerTypes.COMPANY) {
                    return true;
                }

                const blockedDomains = ['gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com'];
                const emailDomain = String(value).toLowerCase().split('@')[1] || '';
                const officialDomain = String(req.body.officialEmailDomain || '')
                    .toLowerCase()
                    .replace(/^@/, '');

                if (blockedDomains.includes(emailDomain)) {
                    throw new Error(
                        'Company contactEmail must use a company domain, not a personal email provider'
                    );
                }

                if (officialDomain && emailDomain !== officialDomain) {
                    throw new Error('contactEmail domain must match officialEmailDomain');
                }

                return true;
            }),

        body('contactPhone')
            .notEmpty()
            .withMessage('contactPhone is required')
            .trim()
            .isMobilePhone()
            .withMessage('contactPhone must be a valid phone number'),

        body('taxId')
            .if(
                body('organizerType').custom((value) =>
                    [organizerTypes.BUSINESS, organizerTypes.COMPANY].includes(value)
                )
            )
            .notEmpty()
            .withMessage('taxId is required for business and company organizers')
            .trim()
            .isString(),

        body('registrationNumber')
            .if(body('organizerType').equals(organizerTypes.COMPANY))
            .notEmpty()
            .withMessage('registrationNumber is required for company organizers')
            .trim()
            .isString(),

        body('officialEmailDomain')
            .if(body('organizerType').equals(organizerTypes.COMPANY))
            .notEmpty()
            .withMessage('officialEmailDomain is required for company organizers')
            .trim()
            .isString()
            .custom((value) => {
                const domain = value.toLowerCase().replace(/^@/, '');
                const blockedDomains = ['gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com'];

                if (blockedDomains.includes(domain)) {
                    throw new Error(
                        'Please use a company domain instead of a personal email provider'
                    );
                }

                if (!domain.includes('.') || domain.startsWith('.') || domain.endsWith('.')) {
                    throw new Error('officialEmailDomain must be a valid company domain');
                }

                return true;
            }),

        body('officialDocumentsDisk').optional().trim().isString(),
        body('officialDocumentsPath').optional().trim().isString(),
        body('profilePhotoDisk').optional().trim().isString(),
        body('profilePhotoPath').optional().trim().isString(),

        body('officialDocument').custom((_, { req }) => {
            if (!req.file) {
                return true;
            }

            const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];

            if (!allowedMimeTypes.includes(req.file.mimetype)) {
                throw new Error('officialDocument must be PDF or image (jpeg/png/webp)');
            }

            const maxFileSizeInBytes = 5 * 1024 * 1024;
            if (req.file.size > maxFileSizeInBytes) {
                throw new Error('officialDocument must be 5MB or smaller');
            }

            return true;
        }),
    ];

    sendOrganizerContactEmailVerification = [];

    resendOrganizerContactEmailVerification = this.sendOrganizerContactEmailVerification;

    verifyOrganizerContactEmail = [
        body('otp')
            .notEmpty()
            .withMessage({ message: 'otp is required', code: 'VALIDATION_REQUIRED' })
            .trim()
            .isLength({ min: 6, max: 6 })
            .withMessage('OTP must be 6 digits long')
            .isNumeric()
            .withMessage('OTP must contain only numbers'),
    ];
}

export default new UserValidation();
export { UserValidation };
