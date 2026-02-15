import * as applicationService from "../services/applicationService.js";


//--- Accept Application ---//
export const acceptApplication = async (req, res) => {
  try {
    const applicationId = Number(req.params.id);
    const establishmentId = req.user.user_id;

    const result = await applicationService.acceptApplicationService(applicationId, establishmentId);

    res.status(200).json(result);
  } catch (error) {
    console.error("ACCEPT APPLICATION ERROR:", error);
    res.status(error.message === "Application not found or not authorized" ? 404 : 500).json({
      message: error.message || "Failed to accept application",
    });
  }
};

//--- Reject Application ---//
export const rejectApplication = async (req, res) => {
  try {
    const applicationId = Number(req.params.id);
    const establishmentId = req.user.user_id;

    const result = await applicationService.rejectApplicationService(applicationId, establishmentId);

    res.status(200).json(result);
  } catch (error) {
    console.error("REJECT APPLICATION ERROR:", error);
    res.status(error.message === "Application not found or not authorized" ? 404 : 500).json({
      message: error.message || "Failed to reject application",
    });
  }
};


//--- Worker marks as completed ---//
export const markAsCompletedByWorker = async (req, res) => {
  try {
    const applicationId = Number(req.params.id);
    const workerId = req.user.user_id;

    const result = await applicationService.markAsCompletedByWorkerService(applicationId, workerId);

    res.status(200).json(result);
  } catch (error) {
    console.error("MARK COMPLETED ERROR:", error);
    res.status(error.message === "Application not found or status not valid" ? 404 : 500).json({
      message: error.message || "Failed to update status"
    });
  }
};


//--- Establishment confirms completion ---//
export const confirmCompletion = async (req, res) => {
  try {
    const applicationId = Number(req.params.id);
    const establishmentId = req.user.user_id;

    const result = await applicationService.confirmCompletionService(applicationId, establishmentId);

    res.status(200).json(result);
  } catch (error) {
    console.error("CONFIRM COMPLETION ERROR:", error);
    res.status(error.message === "Application not found or not in correct status" ? 404 : 500).json({
      message: error.message || "Failed to confirm completion"
    });
  }
};