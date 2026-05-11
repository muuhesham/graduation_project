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
import HobbyistRepository from './HobbyistRepository.js';
import BusinessRepository from './BusinessRepository.js';
import CompanyRepository from './CompanyRepository.js';
import VenueRepository from './VenueRepository.js';
import GovernorateRepository from './GovernorateRepository.js';
import EventSeatTierRepository from './EventSeatTierRepository.js';
import SeatRepository from './SeatRepository.js';
import CountryRepository from './CountryRepository.js';
import StateRepository from './StateRepository.js';
import CityRepository from './CityRepository.js';
import TagRepository from './TagRepository.js';
import EventSessionRepository from './EventSessionRepository.js';
import InterestedEventRepository from './InterestedEventRepository.js';
import EventTagRepository from './EventTagRepository.js';
import CategoryRepository from './CategoryRepository.js';
import EventRuleRepository from './EventRuleRepository.js';
import OtpRepository from './OtpRepository.js';
import PhoneOtpRepository from './PhoneOtpRepository.js';
import NewsletterRepository from './NewsletterRepository.js';
import OrganizerFollowerRepository from './OrganizerFollowerRepository.js';
import { NewsletterSubscriber, OrganizerFollower } from '../models/index.js';

const driver = new PrismaDriver(prisma);

const adminRepository = new AdminRepository(driver);
const eventRepository = new EventRepository(driver);
const userRepository = new UserRepository(driver);
const orderRepository = new OrderRepository(driver);
const organizerRepository = new OrganizerRepository(driver);
const ticketTypeRepository = new TicketTypeRepository(driver);
const payoutRepository = new PayoutRepository(driver);
const hobbyistRepository = new HobbyistRepository(driver);
const businessRepository = new BusinessRepository(driver);
const companyRepository = new CompanyRepository(driver);
const venueRepository = new VenueRepository(driver);
const governorateRepository = new GovernorateRepository(driver);
const eventSeatTierRepository = new EventSeatTierRepository(driver);
const seatRepository = new SeatRepository(driver);
const countryRepository = new CountryRepository(driver);
const stateRepository = new StateRepository(driver);
const cityRepository = new CityRepository(driver);
const tagRepository = new TagRepository(driver);
const eventSessionRepository = new EventSessionRepository(driver);
const interestedEventRepository = new InterestedEventRepository(driver);
const eventTagRepository = new EventTagRepository(driver);
const categoryRepository = new CategoryRepository(driver);
const eventRuleRepository = new EventRuleRepository(driver);
const otpRepository = new OtpRepository(driver);
const phoneOtpRepository = new PhoneOtpRepository(driver);
const newsletterRepository = new NewsletterRepository(driver);
const organizerFollowerRepository = new OrganizerFollowerRepository(driver);

export {
    adminRepository,
    eventRepository,
    userRepository,
    orderRepository,
    organizerRepository,
    ticketTypeRepository,
    payoutRepository,
    hobbyistRepository,
    businessRepository,
    companyRepository,
    venueRepository,
    governorateRepository,
    eventSeatTierRepository,
    seatRepository,
    countryRepository,
    stateRepository,
    cityRepository,
    tagRepository,
    eventSessionRepository,
    interestedEventRepository,
    eventTagRepository,
    categoryRepository,
    eventRuleRepository,
    otpRepository,
    phoneOtpRepository,
    newsletterRepository,
    organizerFollowerRepository,
};
