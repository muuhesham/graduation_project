//@ts-check

/**
 * @param {object} overrides
 * @returns {any}
 */
function countryFactory(overrides = {}) {
    return {
        name: 'Egypt',
        code: 'EG',
        phoneCode: '+20',
        taxIdLocale: 'ar-EG',
        currencyCode: 'EGP',
        currencySymbol: 'EGP',
        flagEmoji: '🇪🇬',
        isSupported: true,
        ...overrides,
    };
}

export default countryFactory;
