// Lightweight registry to register observers against repository instances.
// Keep registration centralized here so observers live outside the repository layer.
import EventObserver from './EventObserver.js';
import OrganizerObserver from './OrganizerObserver.js';
import CategoryObserver from './CategoryObserver.js';
import { eventRepository, organizerRepository, categoryRepository } from '../repositories/index.js';

// Register observers
eventRepository.observe(new EventObserver());
organizerRepository.observe(new OrganizerObserver());
categoryRepository.observe(new CategoryObserver());

export default {};
