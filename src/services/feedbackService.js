import { prisma } from "../config/db.js";

//----------------------------- Create Feedback -----------------------------//
export const createFeedbackService = async (establishmentId, { application_id, rating, content }) => {
    if (!application_id || !rating || !content) {
        throw new Error("Missing required fields (application_id, rating, content)");
    }

    // 1. Verify that the application exists, is confirmed, and belongs to the current establishment
    const application = await prisma.application.findFirst({
        where: {
            application_id: Number(application_id),
            status: "COMPLETED_CONFIRMED",
            mission: {
                establishment_id: establishmentId
            }
        },
        include: {
            intervention: true
        }
    });

    if (!application || !application.intervention) {
        throw new Error("Intervention not found or mission not confirmed");
    }

    // 2. Check if feedback already exists for this intervention
    const existingFeedback = await prisma.feedback.findFirst({
        where: {
            intervention_id: application.intervention.intervention_id
        }
    });

    if (existingFeedback) {
        throw new Error("Feedback already submitted for this mission");
    }

    // 3. Create the feedback
    const feedback = await prisma.feedback.create({
        data: {
            intervention_id: application.intervention.intervention_id,
            rating: Number(rating),
            content: content
        }
    });

    return feedback;
};

//----------------------------- Get Worker Feedbacks -----------------------------//
export const getWorkerFeedbacksService = async (workerId) => {
    const feedbacks = await prisma.feedback.findMany({
        where: {
            intervention: {
                application: {
                    worker_profile_id: workerId
                }
            }
        },
        include: {
            intervention: {
                include: {
                    application: {
                        include: {
                            mission: {
                                select: {
                                    title: true,
                                    start_date: true,
                                    establishment: {
                                        select: {
                                            name: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        orderBy: {
            feedback_id: "desc"
        }
    });

    const result = feedbacks.map(f => ({
        feedback_id: f.feedback_id,
        rating: f.rating,
        content: f.content,
        mission_title: f.intervention.application.mission.title,
        date: f.intervention.application.mission.start_date,
        establishment_name: f.intervention.application.mission.establishment.name
    }));

    return result;
};
