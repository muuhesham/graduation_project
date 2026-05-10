import { JWT_KEY } from '../config/env.js';
import jwt from 'jsonwebtoken';
import userRoles from '../constants/enums/userRoles.js';

export const socketOptionalAuth = (socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers['authorization']?.split(' ')[1];
    socket.user = {};
    socket.userId = null;
    socket.userRole = null;

    if (!token) {
        return next();
    }

    try {
        const decoded = jwt.verify(token, JWT_KEY);

        if (decoded.role !== userRoles.USER && decoded.role !== userRoles.ORGANIZER) {
            return next(new Error('Admins are not allowed to connect via socket'));
        }

        socket.userId = decoded.id;
        next();
    } catch (err) {
        return next(new Error('Unauthenticated: Invalid token'));
    }
};
