import jwt from 'jsonwebtoken';
import { sendError } from '../utils/response.js';
import { JWT_KEY } from './../config/env.js';
import authService from '../services/authService.js';
async function auth(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return sendError(res, 'No auth token provided', null, null, 401);
    }
    
    const isAlive = await authService.isAccessAlive({ accessToken: token });
    if (!isAlive) {
        return sendError(res,  'Token revoked', 'REVOKED_TOKEN', null, 401)
    }

    try {
        req.accessToken = token;
        const decoded = jwt.verify(token, JWT_KEY);
        
        if (decoded.role === 'admin') {
            return sendError(res, 'Admins cannot access user/organizer endpoints', 'ADMIN_RESTRICTION', null, 403);
        }

        req.user = decoded;
        next(); 
    } catch (error) {
        return sendError(res, 'Invalid auth token.', null, null, 403);
    }
}

async function adminAuth(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return sendError(res, 'No admin auth token provided', null, null, 401);
    }

    try {
        req.accessToken = token;
        const decoded = jwt.verify(token, JWT_KEY);

        if (decoded.role !== 'admin') {
            return sendError(res, 'Access denied: admin token required', 'NON_ADMIN_TOKEN', null, 403);
        }

        req.user = decoded;
        next();
    } catch (error) {
        return sendError(res, 'Invalid admin auth token.', null, null, 403);
    }
}

function generateToken(payload, experesIn = '15m') {
    return jwt.sign(payload, JWT_KEY, { expiresIn: experesIn})
}

function verifyToken(token) {
    return jwt.verify(token, JWT_KEY);
}

export default auth;
export { generateToken, verifyToken, adminAuth };

