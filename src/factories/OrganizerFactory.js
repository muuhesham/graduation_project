//@ts-check

import OrganizerTypes from './../constants/enums/organizerTypes.js';
import OrganizerErrors from './../constants/messages/errors/organizer.js';
import ValidationError from './../errors/ValidationError.js';
import {
    businessRepository,
    companyRepository,
    hobbyistRepository,
} from './../repositories/index.js';

export default class OrganizerFactory {
    /**
     * @param {string} type
     * @param {string} organizerId
     * @param {any} data
     * @param {any} [tx]
     */
    static async create(type, organizerId, data, tx = null) {
        switch (type) {
            case OrganizerTypes.HOBBYIST:
                return hobbyistRepository.create(
                    {
                        organizerId,
                        nationalId: data.nationalId,
                    },
                    tx
                );
            case OrganizerTypes.BUSINESS:
                return businessRepository.create(
                    {
                        organizerId,
                        commercialRegistration: data.commercialRegistration,
                        taxId: data.taxId,
                    },
                    tx
                );
            case OrganizerTypes.COMPANY:
                return companyRepository.create(
                    {
                        organizerId,
                        registrationNumber: data.registrationNumber,
                        taxId: data.taxId,
                        officialDocumentsDisk: data.officialDocumentsDisk,
                        officialDocumentsPath: data.officialDocumentsPath,
                    },
                    tx
                );
            default:
                throw new ValidationError([
                    {
                        message: OrganizerErrors.INVALID_ORGANIZER_TYPE.message,
                        code: OrganizerErrors.INVALID_ORGANIZER_TYPE.code,
                    },
                ]);
        }
    }
}
