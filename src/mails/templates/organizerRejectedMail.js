/**
 * @param {object} params
 * @param {string} params.name
 * @param {string} params.reason
 */
export default function organizerRejectedMail({ name, reason }) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            .container { font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Organizer Profile Update</h1>
            </div>
            <div class="content">
                <p>Hello ${name},</p>
                <p>We've reviewed your organizer profile and unfortunately, we couldn't approve it at this time.</p>
                <p><strong>Reason:</strong> ${reason}</p>
                <p>Please update your profile information or upload the required documents and submit it again for review.</p>
                <p>If you have any questions, feel free to reply to this email.</p>
                <p>Best regards,<br>The Fa3liat Team</p>
            </div>
        </div>
    </body>
    </html>
    `;
}
