import { body } from "express-validator";
import { Filter } from 'bad-words';

const filter = new Filter();

export const validateChat = ({ message, socket }) => {
    if(!message || message.trim().length === 0) {
        socket.emit('chatbot-reply', { message: 'Message cannot be empty' });
        throw new Error('Empty message');
    }
    if(message.length > 250) {
        socket.emit('chatbot-reply', { message: 'Message cannot be that long' });
        throw new Error('Message too long');
    }
    if(filter.isProfane(message)){
        socket.emit('chatbot-reply', { message: 'This message contains inappropriate language' });
        throw new Error('Profane message');
    }
};
