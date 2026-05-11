//@ts-check

/**
 * @param {object} params
 * @param {string} params.userName
 * @param {string} params.organizerName
 * @param {string} params.eventTitle
 * @param {string} params.eventUrl
 */
export default function newEventNotificationMail({ userName, organizerName, eventTitle, eventUrl }) {
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
                <h1>New Event from ${organizerName}!</h1>
            </div>
            <div class="content">
                <p>Hello ${userName},</p>
                <p>Great news! An organizer you follow, <strong>${organizerName}</strong>, has just published a new event: <strong>${eventTitle}</strong>.</p>
                <p>Check out the event details and grab your tickets before they sell out!</p>
                <a href="${eventUrl}" class="button">View Event</a>
                <p>Best regards,<br>The Fa3liat Team</p>
            </div>
        </div>
    </body>
    </html>
    `;
}
