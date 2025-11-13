import { prisma } from "../config/db.js";
import { calculateAge } from "../utils/calc-age.js";
import { sendSuccess, sendFail, sendError } from "../utils/response.js";
import sanitize from "sanitize-html";

class OnboardingController {
  handleError = (res, error) => {
    console.error(error);

    if (error.code === "P2025") {
      return sendFail(res, { message: "Attendee not found" }, 404);
    }
    if (error.code === "P2002") {
      return sendFail(res, { message: "Preferences already set" }, 400);
    }

    if (error.name === "JsonWebTokenError" || error.message.includes("token")) {
      return sendFail(res, { message: "Invalid token" }, 401);
    }

    return sendError(res, "Internal server error", "INTERNAL_ERROR", null, 500);
  };

  getStatus = async (req, res) => {
    try {
      const userId = req.user.userId;

      const user = await prisma.user.findUnique({
        where: { userId },
      });

      if (!user) {
        return sendFail(res, { message: "User not found" }, 404);
      }
      if (user.isVerified === false) {
        return sendFail(res, { message: "User email not verified" }, 403);
      }

      const attendee = await prisma.attendee.findUnique({
        where: { userId },
      });

      if (!attendee)
        return sendFail(res, { message: "Attendee not found" }, 404);

      const missing = [];
      if (!attendee.birthDate) missing.push("basic");
      if (!attendee.city) missing.push("city");

      const hasPreferences = await prisma.attendeeFavoriteCategory.findFirst({
        where: { attendeeId: userId },
      });
      if (!hasPreferences) missing.push("preferences");

      const isComplete = missing.length === 0;
      if (isComplete) {
        await prisma.attendee.update({
          where: { userId },
          data: { isCompleted: true },
        });
      }

      return sendSuccess(res, { isComplete: isComplete, missing }, 200);
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  updateBasic = async (req, res) => {
    try {
      const userId = req.user.userId;
      const attendeeBirthDate = new Date(sanitize(req.body.attendeeBirthDate));
      const attendeeGender = sanitize(req.body.attendeeGender);

      if (!attendeeBirthDate || !attendeeGender) {
        return sendFail(res, { message: "Missing required fields" }, 400);
      }

      const attendeeAge = calculateAge(attendeeBirthDate);
      if (attendeeAge < 8 || attendeeAge > 110) {
        return sendFail(
          res,
          { message: "Age must be between 8 and 110 years." },
          400
        );
      }

      const user = await prisma.user.findUnique({
        where: { userId },
      });

      if (!user) {
        return sendFail(res, { message: "User not found" }, 404);
      }
      if (user.isVerified === false) {
        return sendFail(res, { message: "User email not verified" }, 403);
      }

      const attendee = await prisma.attendee.upsert({
        where: { userId },
        update: {
          birthDate: attendeeBirthDate,
          gender: attendeeGender,
          // no authProvider update here
        },
        create: {
          userId,
          birthDate: attendeeBirthDate,
          gender: attendeeGender,
          authProvider: "LOCAL", // only on creation
        },
      });

      return sendSuccess(
        res,
        {
          message: "Basic profile info created successfully",
          attendee: {
            userId: attendee.userId,
            birthDate: attendee.birthDate,
            gender: attendee.gender,
          },
        },
        200
      );
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  updatePreferences = async (req, res) => {
    try {
      const userId = req.user.userId;
      const preferences = req.body.preferences?.map((p) =>
        sanitize(p.toUpperCase())
      );

      const user = await prisma.user.findUnique({
        where: { userId },
      });

      if (!user) {
        return sendFail(res, { message: "User not found" }, 404);
      }
      if (user.isVerified === false) {
        return sendFail(res, { message: "User email not verified" }, 403);
      }

      await prisma.attendee.upsert({
        where: { userId },
        update: {},
        create: {
          userId,
          authProvider: "LOCAL",
        },
      });

      if (!preferences || preferences.length === 0) {
        return sendFail(res, { message: "No preferences provided" }, 400);
      }

      const categories = await prisma.category.findMany({
        where: { name: { in: preferences } },
      });

      if (categories.length === 0) {
        return sendFail(res, { message: "No valid categories found" }, 400);
      }

      await Promise.all(
        categories.map((category) =>
          prisma.attendeeFavoriteCategory.create({
            data: { attendeeId: userId, categoryId: category.id },
          })
        )
      );

      return sendSuccess(
        res,
        { message: "Preferences updated successfully", preferences },
        200
      );
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  updateLocation = async (req, res) => {
    try {
      const userId = req.user.userId;
      const city = sanitize(req.body.city);

      if (!city) {
        return sendFail(res, { message: "City is required" }, 400);
      }

      const user = await prisma.user.findUnique({
        where: { userId },
      });
      if (!user) {
        return sendFail(res, { message: "User not found" }, 404);
      }
      if (user.isVerified === false) {
        return sendFail(res, { message: "User email not verified" }, 403);
      }
      const attendee = await prisma.attendee.upsert({
        where: { userId },
        update: {
          city,
        },
        create: {
          userId,
          authProvider: "LOCAL",
        },
      });

      return sendSuccess(
        res,
        {
          message: "Location updated successfully",
          attendee: {
            userId: attendee.userId,
            city: attendee.city,
          },
        },
        200
      );
    } catch (error) {
      return this.handleError(res, error);
    }
  };
}

export const onboardingController = new OnboardingController();
