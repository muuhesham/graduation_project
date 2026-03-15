//@ts-check

import { APP_NAME } from '../../config/env.js';

/**
 * Generic phone OTP template (reusable across flows).
 * @param {{ otp: string, expiresInMinutes: number, intro?: string }} input
 */
export default function phoneOtpTemplate({ otp, expiresInMinutes, intro }) {
    const prefix = intro ? `${intro} ` : '';
    return `${prefix}${APP_NAME}: Your verification code is ${otp}. It expires in ${expiresInMinutes} minutes.`;
}
