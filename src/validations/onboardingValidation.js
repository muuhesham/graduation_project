import { body } from "express-validator";

const onboardingValidations = {
  updateBasic: [
    body("attendeeBirthDate")
      .isISO8601()
      .withMessage("Birth date must be a valid ISO date (YYYY-MM-DD)."),
    body("attendeeGender")
      .isIn(["MALE", "FEMALE"])
      .withMessage("Gender must be MALE , or FEMALE"),
  ],
  updatePreferences: [
    body("preferences")
      .isArray()
      .withMessage("Preferences must be an array of strings")
      .bail()
      .custom((arr) => arr.length > 0)
      .withMessage("Preferences array must not be empty")
      .bail()
      .custom((arr) => arr.every((p) => typeof p === "string"))
      .withMessage("Each preference must be a string"),
  ],
  updateLocation: [
    body("city")
      .trim()
      .isLength({ min: 2 })
      .withMessage("City must be at least 2 characters"),
  ],
};

export default onboardingValidations;