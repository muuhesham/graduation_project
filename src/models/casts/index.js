//@ts-check

import ICast from './../contracts/ICast.js';

/**
 * @implements {ICast}
 */
export class StringCast extends ICast {
    static cast(value) {
        if (value === null || value === undefined) return null;
        return String(value);
    }
}

export class NumberCast extends ICast {
    static cast(value) {
        if (value === null || value === undefined) return null;
        return Number(value);
    }
}

export class BooleanCast extends ICast {
    static cast(value) {
        if (value === null || value === undefined) return null;
        return Boolean(value);
    }
}

export class DateCast extends ICast {
    static cast(value) {
        if (value === null || value === undefined) return null;
        return value instanceof Date ? value : new Date(value);
    }
}

export class JsonCast extends ICast {
    static cast(value) {
        if (value === null || value === undefined) return null;
        if (typeof value !== 'string') return value;

        try {
            return JSON.parse(value);
        } catch {
            return value;
        }
    }
}

export class EnumCast extends ICast {
    /**
     * @type {readonly any[]}
     */
    static values = [];

    /**
     * @param {any} value
     */
    static cast(value) {
        const allowedValues = this.values || [];

        if (allowedValues.length === 0) {
            return value;
        }

        if (allowedValues.includes(value)) {
            return value;
        }

        const normalized = String(value);
        const matched = allowedValues.find((allowed) => String(allowed) === normalized);
        return matched ?? value;
    }
}

export class DecimalCast extends ICast {
    static cast(value) {
        if (value === null || value === undefined) return null;
        return Number(parseFloat(String(value)).toFixed(2));
    }
}

export const stringCast = StringCast;
export const numberCast = NumberCast;
export const booleanCast = BooleanCast;
export const dateCast = DateCast;
export const jsonCast = JsonCast;
export const decimalCast = DecimalCast;
