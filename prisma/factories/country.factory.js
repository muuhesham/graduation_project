//@ts-check

import { faker } from '@faker-js/faker';

/**
 * @param {string | undefined} value
 * @returns {string}
 */
function normalizeCountryCode(value) {
    const code = String(value ?? '')
        .trim()
        .toUpperCase();
    if (/^[A-Z]{2}$/.test(code)) return code;
    return String(faker.location.countryCode('alpha-2') || '')
        .trim()
        .toUpperCase();
}

function countryFactory(overrides = {}) {
    const code = normalizeCountryCode(overrides.code);
    const currencyCode = overrides.currencyCode ?? faker.finance.currencyCode();

    return {
        name: overrides.name ?? faker.location.country(),
        code,
        phoneCode: overrides.phoneCode ?? `+${faker.number.int({ min: 1, max: 999 })}`,
        taxIdLocale: overrides.taxIdLocale ?? 'en-US',
        currencyCode,
        currencySymbol: overrides.currencySymbol ?? faker.finance.currencySymbol(),
        flagEmoji: overrides.flagEmoji ?? '',
        isSupported: overrides.isSupported ?? true,
        ...overrides,
    };
}

export default countryFactory;
