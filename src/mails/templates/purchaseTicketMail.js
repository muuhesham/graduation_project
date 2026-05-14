function purchaseTicketMailTemplate({
    userName,
    eventTitle,
    eventDescription,
    eventDate,
    eventTime,
    venueName,
    venueAddress,
    ticketDetails,
    totalAmount,
    orderId,
    qrCodes,
}) {
    const ticketRows = ticketDetails
        .map(
            (ticket) => `
        <tr>
            <td style="padding: 8px; border: 1px solid #ddd;">${ticket.type}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${ticket.quantity}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">$${ticket.price}</td>
        </tr>
    `
        )
        .join('');

    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h1 style="color: #333; text-align: center; margin-bottom: 30px;">🎉 Purchase Confirmation</h1>

            <p style="font-size: 16px; color: #555; margin-bottom: 20px;">
                Hi <strong>${userName}</strong>,
            </p>

            <p style="font-size: 16px; color: #555; margin-bottom: 30px;">
                Thank you for your purchase! Your tickets have been successfully booked. Here are the details:
            </p>

            <div style="background-color: #f0f8ff; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                <h2 style="color: #2c5aa0; margin-top: 0;">Event Details</h2>
                <p><strong>Event:</strong> ${eventTitle}</p>
                <p><strong>Description:</strong> ${eventDescription}</p>
                <p><strong>Date:</strong> ${eventDate}</p>
                <p><strong>Time:</strong> ${eventTime}</p>
                <p><strong>Venue:</strong> ${venueName}</p>
                <p><strong>Address:</strong> ${venueAddress}</p>
            </div>

            <div style="margin-bottom: 30px;">
                <h2 style="color: #2c5aa0;">Ticket Details</h2>
                <table style="width: 100%; border-collapse: collapse; background-color: white;">
                    <thead>
                        <tr style="background-color: #f5f5f5;">
                            <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Ticket Type</th>
                            <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Quantity</th>
                            <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${ticketRows}
                    </tbody>
                </table>
            </div>

            <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                <h3 style="color: #2e7d32; margin-top: 0;">Order Summary</h3>
                <p style="font-size: 18px; font-weight: bold; color: #2e7d32;">
                    Total Amount: $${totalAmount}
                </p>
                <p><strong>Order ID:</strong> ${orderId}</p>
            </div>

            ${
                qrCodes && qrCodes.length > 0
                    ? `
            <div style="text-align: center; margin-bottom: 30px;">
                <h3 style="color: #2c5aa0;">Your QR Codes</h3>
                <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 15px;">
                    ${qrCodes
                        .map(
                            (qrUrl, index) => `
                        <div>
                            <img src="${qrUrl}" alt="QR Code ${index + 1}" style="max-width: 150px; height: auto; border: 1px solid #ddd; padding: 5px;" />
                            <p style="font-size: 12px; color: #666; margin: 5px 0;">Ticket ${index + 1}</p>
                        </div>
                    `
                        )
                        .join('')}
                </div>
                <p style="font-size: 14px; color: #666; margin-top: 15px;">Show these QR codes at the event entrance</p>
            </div>
            `
                    : ''
            }

            <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107;">
                <h3 style="color: #856404; margin-top: 0;">Important Information</h3>
                <ul style="color: #856404; margin: 0; padding-left: 20px;">
                    <li>Please arrive at least 30 minutes before the event starts</li>
                    <li>Bring a valid ID for verification</li>
                    <li>Tickets are refundable if the event is cancelled</li>
                    <li>For any questions, contact our support team</li>
                </ul>
            </div>

            <p style="font-size: 16px; color: #555; text-align: center; margin-top: 30px;">
                We hope you enjoy the event! 🎊
            </p>

            <p style="font-size: 14px; color: #888; text-align: center; margin-top: 20px;">
                If you have any questions, please don't hesitate to contact us.
            </p>
        </div>
    </div>
    `;
}

export default purchaseTicketMailTemplate;
