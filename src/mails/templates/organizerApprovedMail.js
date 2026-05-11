/**
 * @param {object} params
 * @param {string} params.name
 * @param {string} params.dashboardUrl
 */
export default function organizerApprovedMail({ name, dashboardUrl }) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            .container { font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4f46e5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; padding: 12px 24px; background: #4f46e5; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Welcome to Fa3liat!</h1>
            </div>
            <div class="content">
                <p>Hello ${name},</p>
                <p>Great news! Your organizer profile has been approved by our team.</p>
                <p>You can now access your dashboard to start creating events, managing tickets, and growing your audience.</p>
                <a href="${dashboardUrl}" class="button">Go to Dashboard</a>
                <p>If you have any questions, feel free to reply to this email.</p>
                <p>Best regards,<br>The Fa3liat Team</p>
            </div>
        </div>
    </body>
    </html>
    `;
}
