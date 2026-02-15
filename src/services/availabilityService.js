import { prisma } from "../config/db.js";

//----------------------------- Upsert Availability (Create or Update) -----------------------------//
export const upsertAvailabilityService = async (userId, { date, status }) => {
    if (!date || !status) {
        throw new Error("Date and status are required");
    }

    // Ensure date is at start of day to avoid time collisions
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const availability = await prisma.availability.upsert({
        where: {
            worker_profile_id_date: {
                worker_profile_id: userId,
                date: targetDate,
            },
        },
        update: {
            status: status,
        },
        create: {
            worker_profile_id: userId,
            date: targetDate,
            status: status,
        },
    });

    return availability;
};

//----------------------------- Get Worker Availability -----------------------------//
export const getWorkerAvailabilityService = async (workerId, startDate, endDate) => {
    const where = {
        worker_profile_id: workerId,
    };

    if (startDate && endDate) {
        where.date = {
            gte: new Date(startDate),
            lte: new Date(endDate),
        };
    }

    const availabilities = await prisma.availability.findMany({
        where,
        orderBy: {
            date: "asc",
        },
    });

    return availabilities;
};

//----------------------------- Get My Availability -----------------------------//
export const getMyAvailabilityService = async (userId, month, year) => {
    const where = {
        worker_profile_id: userId,
    };

    if (month && year) {
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0);
        where.date = {
            gte: start,
            lte: end,
        };
    }

    const availabilities = await prisma.availability.findMany({
        where,
        orderBy: {
            date: "asc",
        },
    });

    return availabilities;
};
