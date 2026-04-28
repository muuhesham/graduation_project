import { JWT_KEY } from '../config/env.js';
import jwt from 'jsonwebtoken';

export const socketAuth = (socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers['authorization']?.split(' ')[1];
    if (!token) {
        return next(new Error('Authentication error: Token missing'));
    }
    try{
        const decoded = jwt.verify(token, JWT_KEY);
        socket.userId = decoded.id;
        next();
    }catch(err){
        return next(new Error('Unauthenticated: Invalid token'));
    }
};