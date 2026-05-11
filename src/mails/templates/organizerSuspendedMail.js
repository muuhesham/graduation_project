/**
 * @param {object} params
 * @param {string} params.name
 * @param {string} params.reason
 */
export default function organizerSuspendedMail({ name, reason }) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            .container { font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #92400e; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Account Suspended</h1>
            </div>
            <div class="content">
                <p>Hello ${name},</p>
                <p>We're writing to inform you that your organizer account has been suspended.</p>
                <p><strong>Reason:</strong> ${reason}</p>
                <p>During suspension, you cannot create new events or manage existing ones. If you believe this is an error, please contact our support team.</p>
                <p>Best regards,<br>The Fa3liat Team</p>
            </div>
        </div>
    </body>
    </html>
    `;
}
