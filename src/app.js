import express from "express";
const app = express();

//! BEFORE MIDDLEWARES
import { cors, corsOptions } from "./config/cors.js";
import { activityLogger } from "./middlewares/activityLogger.js";

//! ROUTES
import authRoutes from "./routes/auth.routes.js";
import onboardingRoutes from "./routes/onboarding.routes.js";

import { on } from "node:events";

app.use(cors(corsOptions));
app.use(activityLogger);
app.use(express.json());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/onboarding", onboardingRoutes);

export default app;
