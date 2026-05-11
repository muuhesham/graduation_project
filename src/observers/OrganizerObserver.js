//@ts-check

import BaseObserver from './BaseObserver.js';
import mailService from '../services/mailService.js';
import OrganizerVerificationStatus from '../constants/enums/organizerVerificationStatus.js';
import OrganizerStatus from '../constants/enums/organizerStatus.js';

/**
 * @typedef {import('./../types/models').Organizer} Organizer
 * @typedef {import('./../types/shared').TransactionClient} TransactionClient
 */

/**
 * @extends {BaseObserver<Organizer>}
 */
export default class OrganizerObserver extends BaseObserver {
    /**
     * @param {Organizer} organizer
     * @param {TransactionClient} [tx]
     */
    async updated(organizer, tx) {
        if (organizer.verificationStatus === OrganizerVerificationStatus.REJECTED) {
            await mailService.sendQueued({
                to: organizer.contactEmail,
                subject: 'Organizer Profile Update',
                templateName: 'organizerRejectedMail',
                variables: {
                    name: organizer.name || 'Organizer',
                    reason: organizer.rejectionReason || 'Documents provided were insufficient or invalid.',
                },
            }).catch((err) => {
                console.error(`Failed to send rejection email to organizer ${organizer.id}:`, err);
            });
        }

        if (organizer.status === OrganizerStatus.SUSPENDED && organizer.verificationStatus === OrganizerVerificationStatus.APPROVED) {
            await mailService.sendQueued({
                to: organizer.contactEmail,
                subject: 'Account Suspended',
                templateName: 'organizerSuspendedMail',
                variables: {
                    name: organizer.name || 'Organizer',
                    reason: organizer.suspendReason || 'Policy violations or suspicious activity.',
                },
            }).catch((err) => {
                console.error(`Failed to send suspension email to organizer ${organizer.id}:`, err);
            });
        }
    }
}
