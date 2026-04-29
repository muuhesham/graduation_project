import { orderRepository, ticketTypeRepository } from './../repositories/index.js';

const orderItemService = {
    async ticketsSoldByEvent(eventId) {
        return ticketTypeRepository.ticketSalesByEvent(eventId);
    },

    async revenueByEvent(eventId) {
        return orderRepository.revenueByEvent(eventId);
    },
};

export default orderItemService;
