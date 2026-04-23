import { body, param } from 'express-validator';
import { Filter } from 'bad-words';
import SessionStatus from '../constants/enums/sessionStatus.js';
import EventMode from '../constants/enums/eventMode.js';
import EventType from '../constants/enums/eventType.js';
import fileService from '../services/fileService.js';

const filter = new Filter();

const organizerValidation = {
    createEvent: [
        body('title')
            .trim()
            .isString()
            .withMessage('Title must be a string')
            .notEmpty()
            .withMessage('Title is required'),

        body('description')
            .trim()
            .isString()
            .withMessage('Description must be a string')
            .notEmpty()
            .withMessage('Description is required'),

        body('status')
            .optional()
            .trim()
            .toLowerCase()
            .isIn(Object.values(SessionStatus))
            .withMessage(`Status must be one of ${Object.values(SessionStatus).join(', ')}`),

        body('categoryName')
            .notEmpty()
            .withMessage('Category name is required')
            .isString()
            .withMessage('Category name must be a string')
            .trim(),

        body('banner').custom(async (value, { req }) => {
            if (!req.file) {
                throw new Error('Banner image is required');
            }

            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
            const allowedExt = allowedTypes.map((type) => type.split('/')[1]).join(', ');
            if (!allowedTypes.includes(req.file.mimetype)) {
                await fileService.delete(req.file.path);
                throw new Error(`Only ${allowedExt} formats allowed`);
            }

            if (req.file.size > 5 * 1024 * 1024) {
                await fileService.delete(req.file.path);
                throw new Error('Image too large (Max 5MB)');
            }

            return true;
        }),

        body('location').isObject().withMessage('Location data is required'),
        body('location.latitude').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
        body('location.longitude')
            .isFloat({ min: -180, max: 180 })
            .withMessage('Invalid longitude'),
        body('location.name').trim().isString().notEmpty().withMessage('Venue name is required'),
        body('location.address').trim().isString().notEmpty().withMessage('Address is required'),
        body('location.country').trim().isString().notEmpty().withMessage('Country is required'),
        body('location.state').trim().isString(),
        body('location.city').trim().isString().notEmpty().withMessage('City is required'),
        body('location.zipCode').optional().trim().isString(),
        body('location.googlePlaceId').optional().trim().isString(),

        body('tickets').isArray({ min: 1 }).withMessage('At least one ticket type is required'),
        body('tickets.*.name')
            .trim()
            .notEmpty()
            .withMessage('Ticket name required')
            .custom((value, { req }) => {
                const ticketNames = req.body.tickets.map((ticket) => ticket.name.trim());
                const uniqueNames = new Set(ticketNames);

                if (uniqueNames.size !== ticketNames.length) {
                    throw new Error('Duplicate ticket names are not allowed.');
                }
                return true;
            }),
        body('tickets.*.price').isFloat({ min: 0 }).withMessage('Price must be positive'),
        body('tickets.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
        body('tickets').custom((tickets, { req }) => {
            const type = req.body.type;
            if (type === EventType.FREE) {
                for (let t of tickets) {
                    if (t.price > 0) {
                        throw new Error('Free events cannot have paid tickets');
                    }
                }
            }
            return true;
        }),

        body('sessions')
            .optional()
            .isArray()
            .withMessage('sessions must be an array')
            .custom((sessions, { req }) => {
                const mode = req.body.mode;
                if (!Array.isArray(sessions) || sessions.length === 0) {
                    throw new Error('At least one session is required');
                }
                if (mode === EventMode.SINGLE && sessions.length !== 1) {
                    throw new Error('Single event mode requires exactly one session');
                }

                for (let s of sessions) {
                    if (!s.startDate || !s.endDate) {
                        throw new Error('Each session must have startDate and endDate');
                    }

                    if (new Date(s.startDate) >= new Date(s.endDate)) {
                        throw new Error('startDate must be before endDate');
                    }
                }
                return true;
            }),

        body('type')
            .notEmpty()
            .withMessage('type is required')
            .trim()
            .toLowerCase()
            .isIn(Object.values(EventType))
            .withMessage(`eventType must be ${Object.values(EventType).join(',')}`),

        body('mode')
            .notEmpty()
            .withMessage('mode is required')
            .trim()
            .toLowerCase()
            .isIn(Object.values(EventMode))
            .withMessage(`eventMode must be ${Object.values(EventMode).join(',')}`),

        body('eventRules')
            .optional()
            .isArray({ min: 1, max: 10 })
            .withMessage('Event rules must be an array with 1 to 10 rules')
            .custom((rules) => {
                if (!rules) return true;
                const ruleSet = new Set(rules.map((r) => r.rule.trim().toLowerCase()));
                if (ruleSet.size !== rules.length) {
                    throw new Error('Duplicate event rules or restrictions are not allowed');
                }
                return true;
            }),

        body('eventRules.*.rule')
            .if(body('eventRules').exists())
            .trim()
            .notEmpty()
            .withMessage('Event rule cannot be empty')
            .matches(/^[a-zA-Z0-9\s.,!?'"-():;]+$/)
            .withMessage('Event rules can only contain letters, numbers, and basic punctuation')
            .isLength({ min: 10, max: 70 })
            .withMessage('Each event rule must be at least 10 characters long')
            .custom((rule) => {
                if (!rule) return true;

                const isForbidden = filter.isProfane(rule);

                if (isForbidden) {
                    throw new Error(
                        'This rule contains inappropriate language and cannot be published.'
                    );
                }

                if (/(.)\1{3,}/.test(rule)) {
                    throw new Error('Rule contains repetitive characters');
                }

                return true;
            }),

        body('tags')
            .optional()
            .isArray({ min: 1, max: 10 })
            .withMessage('Tags must be an array with 1 to 10 tags'),

        body('tags.*')
            .if(body('tags').exists())
            .trim()
            .notEmpty()
            .withMessage('Tag name cannot be empty')
            .isString()
            .withMessage('Tag name must be a string')
            .matches(/^[a-zA-Z0-9#_-\s]+$/)
            .withMessage('Tags can only contain letters, spaces, and basic characters')
            .isLength({ min: 2, max: 30 })
            .withMessage('Each tag must be between 2 and 30 characters long')
            .custom((tag) => {
                if (!tag) return true;
                const isForbidden = filter.isProfane(tag);

                if (isForbidden) {
                    throw new Error(
                        'This tag contains inappropriate language and cannot be published.'
                    );
             }
             return true;
            }),

        body('eventType').optional().isString(),

        body(['numberOfRows', 'numberOfColumns', 'priceTiers', 'seatsData'])
            .if(body('eventType').equals('seatmap'))
            .notEmpty()
            .withMessage((value, { path }) => `${path} is required when eventType is provided`),

        body('numberOfRows')
            .if(body('eventType').equals('seatmap'))
            .isInt({ min: 1 })
            .withMessage('numberOfRows must be at least 1'),

        body('priceTiers')
            .if(body('eventType').equals('seatmap'))
            .notEmpty()
            .withMessage('priceTiers is required with seatmap')
            .custom((value, { req }) => {
                let priceTiers = value;
                if (typeof value === 'string') {
                    try {
                        priceTiers = JSON.parse(value);
                    } catch (e) {
                        throw new Error('priceTiers must be a valid JSON array');
                    }
                }
                if (!Array.isArray(priceTiers)) {
                    throw new Error('priceTiers must be an array');
                }
                const ticketTypes = req.body.tickets;
                if (!ticketTypes || !Array.isArray(ticketTypes)) {
                    throw new Error('Ticket types are required to validate prices');
                }

                priceTiers.forEach((tier) => {
                    const matchedType = ticketTypes.find((t) => t.name === tier.name);

                    if (!matchedType) {
                        throw new Error(
                            `Tier name "${tier.name}" does not match any ticket type name`
                        );
                    }

                    if (parseFloat(matchedType.price) !== parseFloat(tier.price)) {
                        throw new Error(
                            `Price mismatch for "${tier.name}": TicketType price (${matchedType.price}) must equal Tier price (${tier.price})`
                        );
                    }
                });

                return true;
            }),

        body('seatsData')
            .if(body('eventType').equals('seatmap'))
            .notEmpty()
            .withMessage('seatsData is required with seatmap')
            .custom((value, { req }) => {
                let seatsData = value;
                let priceTiers = req.body.priceTiers;

                if (typeof seatsData === 'string') {
                    try {
                        seatsData = JSON.parse(value);
                    } catch (e) {
                        throw new Error('seatsData must be a valid JSON array');
                    }
                }
                if (typeof priceTiers === 'string') {
                    try {
                        priceTiers = JSON.parse(priceTiers);
                    } catch (e) {}
                }

                if (!Array.isArray(seatsData)) throw new Error('seatsData must be an array');
                if (!Array.isArray(priceTiers))
                    throw new Error('priceTiers is required to validate seats');

                const validTierNumbers = priceTiers.map((tier, index) =>
                    tier.id ? parseInt(tier.id) : index
                );

                seatsData.forEach((seat, seatIdx) => {
                    if (seat.tierId !== undefined && seat.tierId !== null) {
                        const isValid = validTierNumbers.includes(parseInt(seat.tierId));

                        if (!isValid) {
                            throw new Error(
                                `Seat at index ${seatIdx} has an invalid tierNumber: ${seat.tierId}. ` +
                                    `Must be one of [${validTierNumbers.join(', ')}]`
                            );
                        }
                    }
                });

                return true;
            }),
    ],

    updateEvent: [
        param('eventId')
            .exists()
            .toInt()
            .withMessage('EventID is required')
            .isInt({ gt: 0 })
            .withMessage('EventId must be a postive number'),

        body('title').optional().trim().isString().withMessage('Title must be a string'),

        body('categoryName').optional().isString().withMessage('Category must be a string'),

        body('description')
            .optional()
            .trim()
            .isString()
            .withMessage('Description must be a string'),

        body('location')
            .optional()
            .custom((location) => {
                if (typeof location !== 'object') throw new Error('Location must be an object');
                const { latitude, longitude, name, address, city, country } = location;
                if (latitude !== undefined && (latitude < -90 || latitude > 90))
                    throw new Error('Invalid latitude');
                if (longitude !== undefined && (longitude < -180 || longitude > 180))
                    throw new Error('Invalid longitude');
                if (name !== undefined && typeof name !== 'string')
                    throw new Error('Venue name must be a string');
                if (address !== undefined && typeof address !== 'string')
                    throw new Error('Address must be a string');
                if (city !== undefined && typeof city !== 'string')
                    throw new Error('City must be a string');
                if (country !== undefined && typeof country !== 'string')
                    throw new Error('Country must be a string');
                return true;
            }),

        body('banner').custom(async (value, { req }) => {
            if (!req.file) {
                throw new Error('Banner image is required');
            }

            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
            if (!allowedTypes.includes(req.file.mimetype)) {
                await fileService.delete(req.file.path);
                throw new Error(`Only .jpg, .png, and .gif formats allowed`);
            }

            if (req.file.size > 5 * 1024 * 1024) {
                await fileService.delete(req.file.path);
                throw new Error('Image too large (Max 5MB)');
            }

            return true;
        }),

        body('type')
            .optional()
            .isIn(Object.values(EventType))
            .withMessage(`EventType must be one of ${Object.values(EventType).join(', ')}`),

        body('mode')
            .optional()
            .isIn(Object.values(EventMode))
            .withMessage(`EventMode must be one of ${Object.values(EventMode).join(', ')}`),

        body('sessions')
            .optional()
            .isArray()
            .withMessage('Sessions must be an array')
            .custom((sessions, { req }) => {
                for (const s of sessions) {
                    if (!s.startDate || !s.endDate)
                        throw new Error('Each session must have startDate and endDate');
                    if (new Date(s.startDate) >= new Date(s.endDate))
                        throw new Error('StartDate must be before endDate in each session');
                }

                if (req.body.mode === EventMode.SINGLE && sessions.length > 1) {
                    throw new Error('Single mode events can only have one session');
                }
                return true;
            }),

        body('tickets').optional().isArray().withMessage('Tickets must be an array'),

        body('tickets.*.name')
            .optional()
            .trim()
            .isString()
            .withMessage('Ticket name must be a string'),

        body('tickets.*.price')
            .optional()
            .isFloat({ min: 0 })
            .withMessage('Price must be greater than or equal 0'),

        body('tickets.*.quantity')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Quantity must be at least 1'),

        body('eventRules')
            .optional()
            .isArray({ min: 0, max: 10 })
            .withMessage('Event rules must be an array with 1 to 10 rules')
            .custom((rules) => {
                if (!rules) return true;
                const ruleSet = new Set(rules.map((r) => r.rule.trim().toLowerCase()));
                if (ruleSet.size !== rules.length) {
                    throw new Error('Duplicate event rules or restrictions are not allowed');
                }
                return true;
            }),

        body('eventRules.*.rule')
            .if(body('eventRules').exists())
            .trim()
            .matches(/^[a-zA-Z0-9\s.,!?'"-():;]+$/)
            .withMessage('Event rules can only contain letters, numbers, and basic punctuation')
            .isLength({ min: 10, max: 70 })
            .withMessage('Each event rule must be at least 10 characters long')
            .custom((rule) => {
                if (!rule) return true;

                const isForbidden = filter.isProfane(rule);

                if (isForbidden) {
                    throw new Error(
                        'This rule contains inappropriate language and cannot be published.'
                    );
                }

                if (/(.)\1{3,}/.test(rule)) {
                    throw new Error('Rule contains repetitive characters');
                }

                return true;
            }),

        body('tags')
            .optional()
            .isArray({ min: 0, max: 10 })
            .withMessage('Tags must be an array with 1 to 10 tags'),

        body('tags.*')
            .if(body('tags').exists())
            .trim()
            .isString()
            .withMessage('Tag name must be a string')
            .matches(/^[a-zA-Z0-9#_-\s]+$/)
            .withMessage('Tags can only contain letters, spaces, and basic characters')
            .isLength({ min: 2, max: 30 })
            .withMessage('Each tag must be between 2 and 30 characters long')
            .custom((tag) => {
                if (!tag) return true;
                const isForbidden = filter.isProfane(tag);

                if (isForbidden) {
                    throw new Error(
                        'This tag contains inappropriate language and cannot be published.'
                    );
                }
                return true;
            }),
    ],

    deleteEvent: [
        param('eventId')
            .exists()
            .toInt()
            .withMessage('EventID is required')
            .isInt({ gt: 0 })
            .withMessage('EventId must be a postive number'),
    ],

    cancelEvent: [
        param('eventId')
            .exists()
            .toInt()
            .withMessage('EventID is required')
            .isInt({ gt: 0 })
            .withMessage('EventId must be a postive number'),
    ]
};

export default organizerValidation;
