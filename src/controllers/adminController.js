import * as adminService from "../services/adminService.js";


export const getAdminNotifications = async (req, res) => {
  try {
    const adminId = req.user.user_id;

    const notifications = await adminService.getAdminNotificationsService(adminId);

    res.status(200).json({
      data: notifications,
    });
  } catch (error) {
    console.error("GET ADMIN NOTIFICATIONS ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch notifications",
    });
  }
};



//----------------------------- Get Workers Under Review -----------------------------//
export const getWorkersUnderReview = async (req, res) => {
  try {
    const workers = await adminService.getWorkersUnderReviewService();

    res.status(200).json({ data: workers });
  } catch (error) {
    console.error("GET WORKERS UNDER REVIEW ERROR:", error);
    res.status(500).json({ message: "Failed to fetch workers" });
  }
};


//----------------------------- Approve Worker Verification -----------------------------//
export const approveWorker = async (req, res) => {
  try {
    const workerId = Number(req.params.id);

    const result = await adminService.approveWorkerService(workerId);

    res.status(200).json(result);
  } catch (error) {
    console.error("APPROVE WORKER ERROR:", error);
    res.status(500).json({ message: "Failed to approve worker" });
  }
};


//----------------------------- Reject Worker Verification -----------------------------//
export const rejectWorker = async (req, res) => {
  try {
    const workerId = Number(req.params.id);
    const { reason } = req.body;

    const result = await adminService.rejectWorkerService(workerId, reason);

    res.status(200).json(result);
  } catch (error) {
    console.error("REJECT WORKER ERROR:", error);
    res.status(error.message === "Rejection reason is required" ? 400 : 500).json({ message: error.message || "Failed to reject worker" });
  }
};

//----------------------------- Mark Notification as Read -----------------------------//
export const markNotificationAsRead = async (req, res) => {
  try {
    const adminId = req.user.user_id;
    const notificationId = Number(req.params.id);

    const result = await adminService.markNotificationAsReadService(adminId, notificationId);

    res.status(200).json(result);
  } catch (error) {
    console.error("MARK NOTIFICATION READ ERROR:", error);
    res.status(error.message === "Notification not found" ? 404 : 500).json({
      message: error.message || "Failed to mark notification as read",
    });
  }
};

//----------------------------- Mark All Notifications as Read -----------------------------//
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const adminId = req.user.user_id;

    const result = await adminService.markAllNotificationsAsReadService(adminId);

    res.status(200).json(result);
  } catch (error) {
    console.error("MARK ALL NOTIFICATIONS READ ERROR:", error);
    res.status(500).json({
      message: "Failed to mark all notifications as read",
    });
  }
};

export const getWorkerById = async (req, res) => {
  try {
    const workerId = Number(req.params.id);
    const result = await adminService.getWorkerByIdService(workerId);

    res.status(200).json({
      data: result,
    });
  } catch (error) {
    console.error("GET WORKER BY ID ERROR:", error);
    res.status(error.message === "Worker not found" ? 404 : 500).json({
      message: error.message || "Failed to fetch worker profile",
    });
  }
};


//----------------------------- Get Admin Statistics -----------------------------//
export const getAdminStats = async (req, res) => {
  try {
    const stats = await adminService.getAdminStatsService();

    res.status(200).json({
      data: stats,
    });
  } catch (error) {
    console.error("GET ADMIN STATS ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch admin statistics",
    });
  }
};
