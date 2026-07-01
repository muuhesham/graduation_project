import swaggerJsdoc from 'swagger-jsdoc';
import { APP_URL } from '../config/env.js';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Fa3liat API Documentation',
      version: '1.0.0',
      description: 'API documentation for the Fa3liat Event Management & E-Ticketing System',
    },
    servers: [
      {
        url: APP_URL,
        description: 'Development server',
      },
    ],
    tags: [
      { name: 'Admin', description: 'Administrative functions' },
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Organizer', description: 'Organizer tools' },
      { name: 'Profile', description: 'Profile management' },
      { name: 'Events', description: 'Event management' },
      { name: 'Home', description: 'Home page data' },
      { name: 'Location', description: 'Location and governorates' },
      { name: 'Onboarding', description: 'User onboarding' },
      { name: 'Review', description: 'Event reviews' },
      { name: 'User', description: 'User activities' },
      { name: 'Newsletter', description: 'Newsletter subscription' },
      { name: 'Mobile', description: 'Mobile specific endpoints' },
      { name: 'Orders', description: 'Order and ticketing' },
      { name: 'Category', description: 'Event categories' },
      { name: 'Payment', description: 'Payment processing' },
      { name: 'Search', description: 'Search functionalities' },
      { name: 'Ticket', description: 'Ticket management' },
    ],
  },
  // Path to the API docs
  apis: ['./src/routes/*.js', './src/routes/mobile/*.js'],
};

export const swaggerSpec = swaggerJsdoc(options);
