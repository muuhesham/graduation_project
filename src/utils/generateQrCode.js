import QRCode from 'qrcode';
import path from 'node:path';
import { BASE_PATH } from '../config/env.js';
import fs from 'fs/promises'
import { prisma as prismaClient } from '../config/db.js';

export const generateQrCode = async (ticket) => {
        const QRCODE_ROOT = path.join(BASE_PATH, 'uploads/qr-codes');
        const file = `${ticket.id}.png`;
        const qrPath = path.join(QRCODE_ROOT, file);

        await fs.mkdir(QRCODE_ROOT, { recursive: true });

        const qrData = JSON.stringify({ ticketId: ticket.id });
        
        await QRCode.toFile(qrPath, qrData);

        const relativePath = path.relative(BASE_PATH, qrPath).replace(/\\/g, '/');
        const realCodePath = `/${relativePath}`;
        
        await prismaClient.qrCode.create({
            data: {
                ticketId: ticket.id,
                codePath: realCodePath,
            },
        });

        return qrPath;
};