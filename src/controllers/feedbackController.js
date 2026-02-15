import * as feedbackService from "../services/feedbackService.js";

//----------------------------- Create Feedback -----------------------------//
export const createFeedback = async (req, res) => {
    try {
        const establishmentId = req.user.user_id;
        const feedback = await feedbackService.createFeedbackService(establishmentId, req.body);

        res.status(201).json({
            message: "Feedback submitted successfully",
            data: feedback
        });

    } catch (error) {
        console.error("CREATE FEEDBACK ERROR:", error);
        let status = 500;
        if (error.message.includes("Missing required fields")) status = 400;
        if (error.message === "Intervention not found or mission not confirmed") status = 404;
        if (error.message === "Feedback already submitted for this mission") status = 400;

        res.status(status).json({ message: error.message || "Failed to submit feedback" });
    }
};

//----------------------------- Get Worker Feedbacks -----------------------------//
export const getWorkerFeedbacks = async (req, res) => {
    try {
        const workerId = Number(req.params.id);
        const result = await feedbackService.getWorkerFeedbacksService(workerId);

        res.status(200).json({
            data: result
        });

    } catch (error) {
        console.error("GET WORKER FEEDBACKS ERROR:", error);
        res.status(500).json({ message: "Failed to fetch feedbacks" });
    }
};
