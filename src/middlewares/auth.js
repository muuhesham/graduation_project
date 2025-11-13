import jwt from "jsonwebtoken";
import { sendError } from "../utils/response.js";
import { JWT_KEY } from "./../config/env.js";

const auth = function (req, res, next) {
  const authHeader = req.headers["authorization"];
  const token =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

  if (!token) {
    return sendError(
      res,
      "No authorization token provided",
      "NO_TOKEN",
      null,
      401
    );
  }

  try {
    const decoded = jwt.verify(token, JWT_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("JWT Verification Error:", error.message);

    if (error.name === "TokenExpiredError") {
      return sendError(res, "Token expired", "TOKEN_EXPIRED", null, 401);
    }

    if (error.name === "JsonWebTokenError") {
      return sendError(res, "Invalid token", "INVALID_TOKEN", null, 401);
    }

    return sendError(res, "Authorization failed", "AUTH_FAILED", null, 401);
  }
};

export default auth;
