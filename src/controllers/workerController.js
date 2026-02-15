import * as workerService from "../services/workerService.js";

//----------------------------- Update Worker Profile -----------------------------//
export const updateWorkerProfile = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const updatedProfile = await workerService.updateWorkerProfileService(userId, req.body, req.files);

    res.status(200).json({
      message: "Profile updated successfully",
      data: updatedProfile,
    });
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);
    res.status(500).json({
      message: error.message || "Failed to update profile",
    });
  }
};


//----------------------------- Add Worker Specialities -----------------------------//
export const addWorkerSpecialities = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { speciality_ids } = req.body;

    const result = await workerService.addWorkerSpecialitiesService(userId, speciality_ids);

    // If service returns strict mismatch, it throws. If success (including no-op), it returns result.
    res.status(201).json(result);
  } catch (error) {
    console.error("ADD WORKER SPECIALITIES ERROR:", error);
    const status = error.message === "One or more specialities do not exist" ? 400 : 500;
    res.status(status).json({
      message: error.message || "Failed to add specialities",
    });
  }
};

//----------------------------- Get Worker Specialities -----------------------------//
export const getWorkerSpecialities = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const specialities = await workerService.getWorkerSpecialitiesService(userId);
    res.status(200).json({ data: specialities });
  } catch (error) {
    console.error("GET WORKER SPECIALITIES ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch worker specialities",
    });
  }
};


//----------------------------- Remove Worker Speciality -----------------------------//
export const removeWorkerSpeciality = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const specialityId = Number(req.params.id);

    const result = await workerService.removeWorkerSpecialityService(userId, specialityId);
    res.status(200).json(result);
  } catch (error) {
    console.error("REMOVE WORKER SPECIALITY ERROR:", error);
    const status = (error.message === "Invalid speciality id" || error.message === "Speciality not found for this worker") ? 400 : 500;
    // Note: original code returned 404 for not found, adapting here if needed
    const finalStatus = error.message === "Speciality not found for this worker" ? 404 : status;

    res.status(finalStatus).json({
      message: error.message || "Failed to remove speciality",
    });
  }
};

//----------------------------- Submit Worker Profile for Review -----------------------------//
export const submitWorkerProfile = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const result = await workerService.submitWorkerProfileService(userId);
    res.status(200).json(result);
  } catch (error) {
    console.error("SUBMIT WORKER PROFILE ERROR:", error);
    let status = 500;
    if (error.message === "Worker profile not found") status = 404;
    if (error.message.includes("already submitted") || error.message.includes("required")) status = 400;

    res.status(status).json({
      message: error.message || "Failed to submit worker profile",
    });
  }
};

//----------------------------- Get Worker Profile -----------------------------//
export const getWorkerProfile = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const response = await workerService.getWorkerProfileService(userId);
    res.status(200).json({ data: response });
  } catch (error) {
    console.error("GET MY WORKER PROFILE ERROR:", error);
    res.status(error.message === "Worker profile not found" ? 404 : 500).json({
      message: error.message || "Failed to fetch worker profile",
    });
  }
};

//----------------------------- Get Worker Notifications -----------------------------//
export const getWorkerNotifications = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const notifications = await workerService.getWorkerNotificationsService(userId);
    res.status(200).json({ data: notifications });
  } catch (error) {
    console.error("GET WORKER NOTIFICATIONS ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch notifications",
    });
  }
};

//----------------------------- Mark Worker Notification as Read -----------------------------//
export const markWorkerNotificationAsRead = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const notificationId = Number(req.params.id);
    const result = await workerService.markWorkerNotificationAsReadService(userId, notificationId);
    res.status(200).json(result);
  } catch (error) {
    console.error("MARK WORKER NOTIFICATION READ ERROR:", error);
    res.status(error.message === "Notification not found" ? 404 : 500).json({
      message: error.message || "Failed to mark notification as read",
    });
  }
};


export const markAllWorkerNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const result = await workerService.markAllWorkerNotificationsAsReadService(userId);
    res.status(200).json(result);
  } catch (error) {
    console.error("MARK ALL WORKER NOTIFICATIONS READ ERROR:", error);
    res.status(500).json({
      message: "Failed to mark all notifications as read",
    });
  }
};

//----------------------------- Get My Missions -----------------------------//
export const getMyMissions = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const result = await workerService.getMyMissionsService(userId);
    res.status(200).json({ data: result });
  } catch (error) {
    console.error("GET MY MISSIONS ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch worker missions",
    });
  }
};

//----------------------------- Download CV (Secured) -----------------------------//
export const downloadCV = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const requestorRole = req.user.role;
    const targetUserId = req.params.workerId ? Number(req.params.workerId) : userId;

    const result = await workerService.downloadCVService(userId, requestorRole, targetUserId);

    if (result.type === "url") {
      return res.redirect(result.url);
    } else {
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `inline; filename="${result.filename}"`);
      res.send(result.buffer);
    }
  } catch (error) {
    console.error("DOWNLOAD CV ERROR:", error);
    let status = 500;
    if (error.message === "Access denied") status = 403;
    if (error.message === "CV not found") status = 404;
    res.status(status).json({ message: error.message || "Failed to download CV" });
  }
};