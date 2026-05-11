//@ts-check

import BaseModel from './BaseModel.js';
import { booleanCast, dateCast, stringCast } from './casts.js';
import Ticket from './Ticket.js';

/** @typedef {import('./contracts/ICastableModel').CastDefinition} CastDefinition */
/** @typedef {import('./../types/models').QrCodeData} QrCodeData */

/**
 * @extends {BaseModel<QrCodeData>}
 **/
class QrCode extends BaseModel {
    /** @param {QrCodeData} data */
    constructor(data) {
        super(data);
    }

    /**
     * @returns {CastDefinition[]}
     */
    static getCastDefinitions() {
        return [
            { field: 'id', cast: stringCast },
            { field: 'ticketId', cast: stringCast },
            { field: 'codePath', cast: stringCast },
            { field: 'codeDisk', cast: stringCast },
            { field: 'isActive', cast: booleanCast },
            { field: 'status', cast: stringCast },
            { field: 'createdAt', cast: dateCast },
            { field: 'updatedAt', cast: dateCast },
        ];
    }

    /**
     * @returns {Record<string, any>}
     */
    static get relations() {
        return {
            ticket: Ticket,
        };
    }

    static get resourceName() {
        return 'qrCode';
    }
}

/** @type {typeof QrCode & (new (data: QrCodeData) => QrCode & QrCodeData)} */
const QrCodeExport = /** @type {any} */ (QrCode);
export default QrCodeExport;
