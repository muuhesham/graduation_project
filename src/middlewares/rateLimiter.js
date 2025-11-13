import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import { redis as redisClient } from "../config/redis.js";
import { sendError } from "./../utils/response.js";

function rateLimiter({ windowMs, max, message }) {
  return rateLimit({
    store: new RedisStore({
      sendCommand: (...args) => redisClient.call(...args),
      prefix: "rl:",
    }),
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      return sendError(
        res,
        message || "Too many requests, please try again later.",
        "RATE_LIMIT_EXCEEDED",
        null,
        429
      );
    },
    skipFailedRequests: false,
    skipSuccessfulRequests: false,
  });
}

const strictLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: "Too many attempts. Please try again after 15 minutes.",
});

const authLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: "Too many authentication attempts. Please try again later.",
});

const statusLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // allow up to 30 status checks per minute
  message: {
    status: "fail",
    data: { message: "Too many status requests. Please slow down." },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const onboardingWriteLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // allow 10 write requests per 5 minutes
  message: {
    status: "fail",
    data: {
      message: "Too many onboarding submissions. Please try again later.",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Standard API rate limiter
 * 100 requests per 15 minutes
 * Use for: General API endpoints
 */
const apiLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many requests. Please slow down.",
});

/**
 * Heavy operation rate limiter
 * 20 requests per hour
 * Use for: File uploads, Reports generation
 */
const heavyLimiter = rateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  message: "Too many heavy operations. Please try again later.",
});

/**
 * Email/OTP rate limiter
 * 3 requests per 5 minutes
 * Use for: Sending emails, OTP requests
 */
const emailLimiter = rateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3,
  message: "Too many email requests. Please wait before requesting again.",
});

/**
 * Generous rate limiter for public endpoints
 * 300 requests per 15 minutes
 * Use for: Public data, Search, Browse events
 */
const publicLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  message: "Request limit exceeded. Please try again shortly.",
});

export {
  rateLimiter,
  strictLimiter,
  authLimiter,
  statusLimiter,
  onboardingWriteLimiter,
  apiLimiter,
  heavyLimiter,
  emailLimiter,
  publicLimiter,
};
