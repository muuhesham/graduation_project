//@ts-check

/**
 * @param {object} variables
 * @param {string} variables.email
 * @returns {string}
 */
export default function newsletterWelcomeMail(variables) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            .container { font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Welcome to our Newsletter!</h1>
            </div>
            <div class="content">
                <p>Hello,</p>
                <p>Thank you for subscribing to the Fa3liat newsletter.</p>
                <p>You'll now receive updates on the latest events, exclusive offers, and community news directly at <strong>${variables.email}</strong>.</p>
                <p>Stay tuned for exciting updates!</p>
                <p>Best regards,<br>The Fa3liat Team</p>
            </div>
        </div>
    </body>
    </html>
    `;
}
