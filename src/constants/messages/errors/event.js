const EventErrors = Object.freeze({
    EVENT_NOT_FOUND: {
        code: 'EVENT_NOT_FOUND',
        message: 'The specified event was not found.',
    },

    EVENT_ALREADY_EXISTS: {
        code: 'EVENT_ALREADY_EXISTS',
        message: 'An event with the given identifier already exists.',
    },

    INVALID_EVENT_DATE: {
        code: 'INVALID_EVENT_DATE',
        message: 'The event date provided is invalid.',
    },

    EVENT_CREATION_FAILED: {
        code: 'EVENT_CREATION_FAILED',
        message: 'Failed to create the event. Please try again.',
    },

    EVENT_UPDATE_FAILED: {
        code: 'EVENT_UPDATE_FAILED',
        message: 'Failed to update the event. Please try again.',
    },

    EVENT_DELETION_FAILED: {
        code: 'EVENT_DELETION_FAILED',
        message: 'Failed to delete the event. Please try again.',
    },

    EVENT_DELETE_BLOCKED: {
        code: 'EVENT_DELETE_BLOCKED',
        message: 'Event cannot be deleted because one or more deletion conditions are not met.',
    },

    EVENT_REGISTRATION_CLOSED: {
        code: 'EVENT_REGISTRATION_CLOSED',
        message: 'Registration for this event is closed.',
    },

    EVENT_CAPACITY_FULL: {
        code: 'EVENT_CAPACITY_FULL',
        message: 'The event has reached its maximum capacity.',
    },

    UNAUTHORIZED_EVENT_ACCESS: {
        code: 'UNAUTHORIZED_EVENT_ACCESS',
        message: 'You are not authorized to access this event.',
    },

    INVALID_EVENT_STATUS: {
        code: 'INVALID_EVENT_STATUS',
        message: 'The event status provided is invalid.',
    },

    EVENT_TITLE_CONFLICT: {
        code: 'EVENT_TITLE_CONFLICT',
        message: 'An event with the same title already exists.',
    },

    EVENT_CANNOT_BE_CANCELLED: {
        code: 'EVENT_CANNOT_BE_CANCELLED',
        message:
            'This event cannot be cancelled due to its current status or associated conditions.',
    },
});

export default EventErrors;
