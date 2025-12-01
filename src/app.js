import express from 'express';
import helmet from 'helmet';
const app = express();
import { UPLOADS_ROOT } from './services/storage/localDriver.js';

//! BEFORE MIDDLEWARES
import { cors, corsOptions } from './config/cors.js';
import { activityLogger } from './middlewares/activityLogger.js';

app.use(helmet());
app.use(cors(corsOptions));
app.use(activityLogger);
app.use(express.json());

app.use('/uploads', express.static(UPLOADS_ROOT));

//! ROUTES
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import organizerRoutes from './routes/organizer.routes.js';
import homeRoutes from './routes/home.routes.js';
import eventRoutes from './routes/event.routes.js';
import onboardingRoutes from './routes/onboarding.routes.js';

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/onboarding', onboardingRoutes)
app.use('/api/v1/organizer', organizerRoutes);
app.use('/api/v1/home', homeRoutes);
app.use('/api/v1/events', eventRoutes);

//! AFTER MIDDLEWARES
import { errorHandler } from './middlewares/errorHandler.js';

app.use(errorHandler);
export default app;
