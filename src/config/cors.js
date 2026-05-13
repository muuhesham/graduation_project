import cors from 'cors';
import { FRONT_URL } from '../config/env.js';

const corsOptions = {
    origin: FRONT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
};


export { cors, corsOptions };
