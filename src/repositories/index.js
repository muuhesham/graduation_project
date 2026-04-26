//@ts-check

import { prisma } from './../config/db.js';

import PrismaDriver from './drivers/PrismaDriver.js';

import AdminRepository from './AdminRepository.js';
import EventRepository from './EventRepository.js';
import UserRepository from './UserRepository.js';
import OrderRepository from './OrderRepository.js';
import OrganizerRepository from './OrganizerRepository.js';
import TicketTypeRepository from './TicketTypeRepository.js';
import PayoutRepository from './PayoutRepository.js';

const driver = new PrismaDriver(prisma);

const adminRepository = new AdminRepository(driver);
const eventRepository = new EventRepository(driver);
const userRepository = new UserRepository(driver);
const orderRepository = new OrderRepository(driver);
const organizerRepository = new OrganizerRepository(driver);
const ticketTypeRepository = new TicketTypeRepository(driver);
const payoutRepository = new PayoutRepository(driver);

export {
    adminRepository,
    eventRepository,
    userRepository,
    orderRepository,
    organizerRepository,
    ticketTypeRepository,
    payoutRepository,
};

