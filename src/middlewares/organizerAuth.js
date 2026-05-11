import auth from './auth.js';
import { sendError } from '../utils/response.js';
import UserRoles from '../constants/enums/userRoles.js';

const organizerAuth = async (req, res, next) => {
    auth(req, res, async (err) => {
        if (err) return next(err);

        if (req.user.role !== UserRoles.ORGANIZER) {
            return sendError(res, 'Access denied. Organizer role required.', 'ACCESS_DENIED', null, 403);
        }

        next();
    });
};

export default organizerAuth;
