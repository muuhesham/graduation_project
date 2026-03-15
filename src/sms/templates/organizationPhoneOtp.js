//@ts-check

import { APP_NAME } from '../../config/env.js';

/**
 * Organization-specific phone OTP template.
 * @param {{ otp: string, expiresInMinutes: number, organizationName?: string, intro?: string }} input
 */
export default function organizationPhoneOtpTemplate({
    otp,
    expiresInMinutes,
    organizationName,
    intro,
}) {
    const prefix = intro ? `${intro} ` : '';
    const orgPart = organizationName ? ` for ${organizationName}` : '';
    return `${prefix}${APP_NAME}: Confirm your organization phone${orgPart} with code ${otp}. Expires in ${expiresInMinutes} minutes.`;
}
