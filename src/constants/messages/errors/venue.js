const VenueErrors = Object.freeze({
    VENUE_NOT_FOUND: {
        code: 'VENUE_NOT_FOUND',
        message: 'The specified venue was not found.',
    },

    VENUE_ALREADY_EXISTS: {
        code: 'VENUE_ALREADY_EXISTS',
        message: 'A venue with the given identifier already exists.',
    },

    VENUE_CREATION_FAILED: {
        code: 'VENUE_CREATION_FAILED',
        message: 'Failed to create the venue. Please try again.',
    },

    VENUE_UPDATE_FAILED: {
        code: 'VENUE_UPDATE_FAILED',
        message: 'Failed to update the venue. Please try again.',
    },

    VENUE_DELETION_FAILED: {
        code: 'VENUE_DELETION_FAILED',
        message: 'Failed to delete the venue. Please try again.',
    },

    VENUE_IN_USE: {
        code: 'VENUE_IN_USE',
        message: 'Venue cannot be deleted or modified because it is currently associated with active events.',
    },

    INVALID_VENUE_LOCATION: {
        code: 'INVALID_VENUE_LOCATION',
        message: 'The provided location coordinates are invalid.',
    },

    UNAUTHORIZED_VENUE_ACCESS: {
        code: 'UNAUTHORIZED_VENUE_ACCESS',
        message: 'You are not authorized to manage this venue.',
    },

    GOOGLE_PLACE_ID_CONFLICT: {
        code: 'GOOGLE_PLACE_ID_CONFLICT',
        message: 'A venue with this Google Place ID already exists.',
    },
});

export default VenueErrors;
