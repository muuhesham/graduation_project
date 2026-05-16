import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_PATH = path.join(__dirname, '/..', '..');

dotenv.config({
    path: BASE_PATH + '/.env',
    quiet: true,
});

export const APP_NAME = process.env.APP_NAME;
export const PUBLIC_HOST = process.env.PUBLIC_HOST || process.env.HOSTNAME || 'localhost';
export const BIND_HOST = process.env.BIND_HOST || process.env.HOSTNAME || '0.0.0.0';
export const HOSTNAME = process.env.HOSTNAME || PUBLIC_HOST;
export const DATABASE_URL = process.env.DATABASE_URL;
export const JWT_KEY = process.env.JWT_KEY;
export const PORT = process.env.PORT || 3000;
export const DATABASE_NAME = process.env.DATABASE_NAME;
export const SMS_PROVIDER = process.env.SMS_PROVIDER || 'mock';
export const CLIENT_ID = process.env.CLIENT_ID;
export const CLIENT_SECRET = process.env.CLIENT_SECRET;
export const CALLBACK_URL = process.env.CALLBACK_URL;
export const GOOGLE_REDIRECT_URL = process.env.GOOGLE_REDIRECT_URL;
export const MAIL_HOST = process.env.MAIL_HOST;
export const MAIL_PORT = process.env.MAIL_PORT;
export const MAIL_USER = process.env.MAIL_USER;
export const MAIL_PASS = process.env.MAIL_PASS;
export const MAIL_FROM = process.env.MAIL_FROM;

export const NEWSLETTER_JWT_KEY = process.env.NEWSLETTER_JWT_KEY;
export const NEWSLETTER_JWT_EXPIRY = process.env.NEWSLETTER_JWT_EXPIRY;
export const REDIS_URL = process.env.REDIS_URL || 'redis://';
export const JWT_REKEY = process.env.JWT_REKEY;
export const FRONT_URL = process.env.FRONT_URL;

export const NEWSLETTER_CONFIRMATION_SUCCESS_URL = `${FRONT_URL}${process.env.NEWSLETTER_CONFIRMATION_SUCCESS_URL}`;
export const NEWSLETTER_CONFIRMATION_ALREADY_SUBSCRIBED_URL =
    `${FRONT_URL}${process.env.NEWSLETTER_CONFIRMATION_ALREADY_SUBSCRIBED_URL}`;
export const NEWSLETTER_CONFIRMATION_FAILURE_URL = `${FRONT_URL}${process.env.NEWSLETTER_CONFIRMATION_FAILURE_URL}`;

export const NODE_ENV = process.env.NODE_ENV || 'development';
export const STORAGE_TYPE = process.env.STORAGE_TYPE || 'local';
export const PROTOCOL = process.env.PROTOCOL || 'http';
export const APP_URL = process.env.APP_URL || `${PROTOCOL}://${PUBLIC_HOST}:${PORT}`;
export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
export const SUCCESS_URL = `${process.env.FRONT_URL}${process.env.SUCCESS_ROUTE}`;
export const CANCEL_URL = `${process.env.FRONT_URL}${process.env.CANCEL_ROUTE}`;
export const APP_CURRENCY = process.env.APP_CURRENCY || 'USD';
export const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
export const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
export const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;
export const AI_API_KEY = process.env.AI_API_KEY;

export const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
export const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'nomic-embed-text-v2-moe:latest';
export const OLLAMA_TIMEOUT = parseInt(process.env.OLLAMA_TIMEOUT) || 30000;
export const OLLAMA_DIMENSION = parseInt(process.env.OLLAMA_DIMENSION) || 768;

export { BASE_PATH };
