import { body } from "express-validator";
import { Filter } from 'bad-words';

const filter = new Filter();

export const validateChat = ({ message, socket }) => {
    if(message.length > 250) {
        return socket.emit('chatbot-reply', { text: 'Message cannot be that long or empty' });
    }
    if(filter.isProfane(message)){
        return socket.emit('chatbot-reply', { text: 'This message contains inappropriate language' });
    }
};
