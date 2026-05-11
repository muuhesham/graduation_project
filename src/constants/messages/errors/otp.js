//@ts-check

/**
 * @readonly
 * @enum {Object}
 */

const OtpErrors = Object.freeze({
    INVALID_OTP: {
        code: 'INVALID_OTP',
        message: 'The provided OTP is invalid.',
    },

    EXPIRED_OTP: {
        code: 'EXPIRED_OTP',
        message: 'The provided OTP has expired.',
    },

    OTP_VERIFICATION_FAILED: {
        code: 'OTP_VERIFICATION_FAILED',
        message: 'OTP verification failed. Please try again.',
    },
});

export default OtpErrors;
