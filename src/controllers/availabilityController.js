import * as availabilityService from "../services/availabilityService.js";

//----------------------------- Upsert Availability (Create or Update) -----------------------------//
export const upsertAvailability = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const availability = await availabilityService.upsertAvailabilityService(userId, req.body);

        res.status(200).json({
            message: "Availability updated successfully",
            data: availability,
        });
    } catch (error) {
        console.error("UPSERT AVAILABILITY ERROR:", error);
        res.status(500).json({
            message: error.message || "Failed to update availability",
        });
    }
};

//----------------------------- Get Worker Availability -----------------------------//
export const getWorkerAvailability = async (req, res) => {
    try {
        const workerId = Number(req.params.id);
        const { start_date, end_date } = req.query;

        const availabilities = await availabilityService.getWorkerAvailabilityService(workerId, start_date, end_date);

        res.status(200).json({
            data: availabilities,
        });
    } catch (error) {
        console.error("GET AVAILABILITY ERROR:", error);
        res.status(500).json({
            message: "Failed to fetch availability",
        });
    }
};

//----------------------------- Get My Availability -----------------------------//
export const getMyAvailability = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { month, year } = req.query;

        const availabilities = await availabilityService.getMyAvailabilityService(userId, month, year);

        res.status(200).json({
            data: availabilities,
        });
    } catch (error) {
        console.error("GET MY AVAILABILITY ERROR:", error);
        res.status(500).json({
            message: "Failed to fetch your availability",
        });
    }
};
