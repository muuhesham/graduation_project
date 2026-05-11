import { body } from 'express-validator';
import organizerTypes from './../constants/enums/organizerTypes.js';

class UserValidation {
    /** @typedef {import('./../types/dtos').UpgradeToOrganizerDTO} */
    upgradeToOrganizer = [
        body('type')
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
        body('websiteUrl').optional().trim().isString(),
        body('contactName').optional().trim().isString(),
        body('instagramUrl')
            .optional()
            .trim()
            .isString()
            .isURL({
                protocols: ['http', 'https'],
                require_protocol: true,
                host_whitelist: ['instagram.com', 'www.instagram.com'],
            })
            .withMessage('Instagram URL must be a valid Instagram link'),
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

        body('websiteUrl')
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
            .if(body('type').equals(organizerTypes.HOBBYIST))
            .notEmpty()
            .withMessage('nationalId is required for hobbyist organizers')
            .trim()
            .isString(),

        body('ownerName')
            .if(body('type').equals(organizerTypes.BUSINESS))
            .notEmpty()
            .withMessage('ownerName is required for business organizers')
            .trim()
            .isString(),

        body('commercialRegistration')
            .if(body('type').equals(organizerTypes.BUSINESS))
            .notEmpty()
            .withMessage('commercialRegistration is required for business organizers')
            .trim()
            .isString(),

        body('contactEmail')
            .notEmpty()
            .withMessage('contactEmail is required')
            .trim()
            .isEmail()
            .toLowerCase()
            .withMessage('contactEmail must be a valid email address')
            .custom((value, { req }) => {
                if (req.body.type !== organizerTypes.COMPANY) {
                    return true;
                }

                const blockedDomains = ['gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com'];
                const emailDomain = String(value).toLowerCase().split('@')[1] || '';

                if (blockedDomains.includes(emailDomain)) {
                    throw new Error(
                        'Company contactEmail must use a professional domain, not a personal email provider'
                    );
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
                body('type').custom((value) =>
                    [organizerTypes.BUSINESS, organizerTypes.COMPANY].includes(value)
                )
            )
            .notEmpty()
            .withMessage('taxId is required for business and company organizers')
            .trim()
            .isString(),

        body('registrationNumber')
            .if(body('type').equals(organizerTypes.COMPANY))
            .notEmpty()
            .withMessage('registrationNumber is required for company organizers')
            .trim()
            .isString(),

        body('officialDocumentsDisk').optional().trim().isString(),
        body('officialDocumentsPath').optional().trim().isString(),
        body('profilePhotoDisk').optional().trim().isString(),
        body('profilePhotoPath').optional().trim().isString(),

        body('officialDocument').custom((_, { req }) => {
            if (!req.file) {
                if (req.body.type === organizerTypes.COMPANY) {
                    throw new Error('officialDocument is required for company organizers');
                }
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

    resendOrganizerEmailOtp = [];

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
