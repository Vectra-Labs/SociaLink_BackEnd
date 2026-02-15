import * as establishmentService from "../services/establishmentService.js";

//----------------------------- Search Workers -----------------------------//
export const searchWorkers = async (req, res) => {
    try {
        const result = await establishmentService.searchWorkersService(req.query);
        res.status(200).json({
            data: result,
        });
    } catch (error) {
        console.error("SEARCH WORKERS ERROR:", error);
        res.status(500).json({
            message: "Failed to search workers",
        });
    }
};

//----------------------------- Get Worker By ID (for Establishment) -----------------------------//
export const getWorkerById = async (req, res) => {
    try {
        const workerId = Number(req.params.id);
        const result = await establishmentService.getWorkerByIdService(workerId);
        res.status(200).json({ data: result });
    } catch (error) {
        console.error("GET WORKER BY ID ERROR:", error);
        res.status(error.message === "Worker not found" ? 404 : 500).json({
            message: error.message || "Failed to fetch worker profile",
        });
    }
};

//----------------------------- Get My Profile (for current Establishment) -----------------------------//
export const getMyProfile = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const result = await establishmentService.getMyProfileService(userId);
        res.status(200).json({ data: result });
    } catch (error) {
        console.error("GET MY PROFILE ERROR:", error);
        res.status(error.message === "Establishment profile not found" ? 404 : 500).json({
            message: error.message || "Failed to fetch profile"
        });
    }
};

//----------------------------- Update My Profile (for current Establishment) -----------------------------//
export const updateMyProfile = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const updatedProfile = await establishmentService.updateMyProfileService(userId, req.body, req.file);

        res.status(200).json({
            message: "Profile updated successfully",
            data: updatedProfile
        });
    } catch (error) {
        console.error("UPDATE MY PROFILE ERROR:", error);
        res.status(500).json({ message: error.message || "Failed to update profile" });
    }
};

//----------------------------- Get Establishment Notifications -----------------------------//
export const getEstablishmentNotifications = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const notifications = await establishmentService.getEstablishmentNotificationsService(userId);
        res.status(200).json({ data: notifications });
    } catch (error) {
        console.error("GET ESTABLISHMENT NOTIFICATIONS ERROR:", error);
        res.status(500).json({
            message: "Failed to fetch notifications",
        });
    }
};

//----------------------------- Mark Establishment Notification as Read -----------------------------//
export const markEstablishmentNotificationAsRead = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const notificationId = Number(req.params.id);
        const result = await establishmentService.markEstablishmentNotificationAsReadService(userId, notificationId);
        res.status(200).json(result);
    } catch (error) {
        console.error("MARK ESTABLISHMENT NOTIFICATION READ ERROR:", error);
        res.status(error.message === "Notification not found" ? 404 : 500).json({
            message: error.message || "Failed to mark notification as read",
        });
    }
};

//----------------------------- Mark All Establishment Notifications as Read -----------------------------//
export const markAllEstablishmentNotificationsAsRead = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const result = await establishmentService.markAllEstablishmentNotificationsAsReadService(userId);
        res.status(200).json(result);
    } catch (error) {
        console.error("MARK ALL ESTABLISHMENT NOTIFICATIONS READ ERROR:", error);
        res.status(500).json({
            message: "Failed to mark all notifications as read",
        });
    }
};

//----------------------------- Get Establishment Stats (Dashboard) -----------------------------//
export const getEstablishmentStats = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const stats = await establishmentService.getEstablishmentStatsService(userId);
        res.status(200).json({ data: stats });
    } catch (error) {
        console.error("GET ESTABLISHMENT STATS ERROR:", error);
        res.status(500).json({
            message: "Failed to fetch dashboard stats",
        });
    }
};