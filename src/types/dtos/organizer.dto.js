//@ts-check

/**
 * @typedef {Object} OrganizerCreateDTO
 * @property {string} [organizerType]
 * @property {import('@prisma/client').OrganizerType} [type]
 * @property {string} name
 * @property {string} contactEmail
 * @property {string} contactPhone
 * @property {number} countryId
 * @property {number} stateId
 * @property {number} cityId
 * @property {string} [description]
 * @property {string} [website]
 * @property {string} [contactPersonName]
 * @property {string} [instagramUrl]
 * @property {string} [facebookUrl]
 * @property {string} [twitterUrl]
 * @property {string} [linkedinUrl]
 * @property {string} [youtubeUrl]
 * @property {string} [logoDisk]
 * @property {string} [logoPath]
 * @property {string} [coverDisk]
 * @property {string} [coverPath]
 * @property {string} [address]
 * @property {string} [verificationStatus]
 * @property {string} [status]
 * @property {string} [suspendReason]
 * @property {string} [rejectionReason]
 * @property {string} [reviewedById]
 * @property {Date} [reviewedAt]
 * @property {string} [nationalId]
 * @property {string} [ownerName]
 * @property {string} [commercialRegistration]
 * @property {string} [taxId]
 * @property {string} [registrationNumber]
 * @property {string} [officialEmailDomain]
 * @property {string} [officialDocumentsDisk]
 * @property {string} [officialDocumentsPath]
 * @property {string} [profilePhotoDisk]
 * @property {string} [profilePhotoPath]
 *
 * @typedef {Object} CompanyCreateDTO
 * @property {string} organizerId
 * @property {string} [registrationNumber]
 * @property {string} [taxId]
 * @property {string} [officialDocumentsDisk]
 * @property {string} [officialDocumentsPath]
 *
 * @typedef {Object} BusinessCreateDTO
 * @property {string} organizerId
 * @property {string} [commercialRegistration]
 * @property {string} [taxId]
 *
 * @typedef {Object} HobbyistCreateDTO
 * @property {string} organizerId
 * @property {string} [nationalId]
 */

export {};
