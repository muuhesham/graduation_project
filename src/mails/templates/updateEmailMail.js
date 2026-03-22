function updateEmailTemplate({ name, newEmail, confirmUrl }) {
    return `
    <div style="font-family: Arial; padding: 20px; background-color: #f9f9f9;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
        <h2 style="color: #333;">Hi ${name},</h2>
        <p>You requested to update your email address to:</p>
        <p style="font-weight: bold; color: #1d4ed8;">${newEmail}</p>
        <p>To confirm this change, please click the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${confirmUrl}" style="background-color: #1d4ed8; color: #ffffff; padding: 12px 25px; border-radius: 5px; text-decoration: none; font-weight: bold;">Confirm Email</a>
        </div>
        <p>If you didn't request this change, you can safely ignore this email.</p>
        <p style="font-size: 12px; color: #888;">This email was sent automatically. Please do not reply.</p>
      </div>
    </div>
  `;
}

export default updateEmailTemplate;
