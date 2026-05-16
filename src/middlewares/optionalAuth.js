import jwt from 'jsonwebtoken';
import { JWT_KEY } from './../config/env.js';
import authService from '../services/authService.js';
async function optionalAuth(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        req.user = {};
        return next();
    }

    const isAlive = await authService.isAccessAlive({ accessToken: token });

    if (!isAlive) {
        req.user = {};
        return next();
    }

    try {
        req.accessToken = token;
        const decoded = jwt.verify(token, JWT_KEY);
        
        if (decoded.role === 'admin') {
            req.user = {};
        } else {
            req.user = decoded;
        }
    } catch (err) {
        req.user = {};
    }
    next();
}
export default optionalAuth;
