import {body, param} from 'express-validator';

const couponValidation = {
    createCoupon: [
        body('code')
            .trim()
            .notEmpty().withMessage('Code cannot be empty')
            .matches(/^[A-Za-z0-9_-]+$/).withMessage('Code can only contain letters, numbers, underscores, and hyphens')
            .isLength({ min: 3, max: 20 }).withMessage('Code must be between 3 and 20 characters'),
        body('discount')
            .notEmpty().withMessage('Discount cannot be empty')
            .isFloat({ gt: 0, lt: 100 }).withMessage('Discount must be a number between 0 and 100'),
    ],

    deleteCoupon: [
        param('id')
            .exists()
            .withMessage('Coupon ID is required')
            .toInt(10)
            .isInt({ gt: 0 })
            .withMessage('Coupon ID must be a positive integer'),
    ],
    
};

export default couponValidation;