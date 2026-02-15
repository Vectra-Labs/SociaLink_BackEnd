import { prisma } from "../config/db.js";

//--- Accept Application ---//
export const acceptApplicationService = async (applicationId, establishmentId) => {
    //  Vérifier que la candidature existe
    //    et qu'elle appartient à une mission de cet établissement
    const application = await prisma.application.findFirst({
        where: {
            application_id: applicationId,
            status: "PENDING",
            mission: {
                establishment_id: establishmentId,
            },
        },
        include: {
            worker: {
                select: { user_id: true },
            },
        },
    });

    if (!application) {
        throw new Error("Application not found or not authorized");
    }

    //  Transaction : accepter + notifier le worker + passer la mission en ONGOING
    await prisma.$transaction([
        prisma.application.update({
            where: { application_id: applicationId },
            data: { status: "ACCEPTED" },
        }),
        prisma.mission.update({
            where: { mission_id: application.mission_id },
            data: { status: "ONGOING" },
        }),
        prisma.notification.create({
            data: {
                user_id: application.worker.user_id,
                type: "SUCCESS",
                message: "Votre candidature a été acceptée 🎉",
            },
        }),
    ]);

    return { message: "Application accepted successfully" };
};

//--- Reject Application ---//
export const rejectApplicationService = async (applicationId, establishmentId) => {
    // Vérifier que la candidature existe et appartient à une mission de cet établissement
    const application = await prisma.application.findFirst({
        where: {
            application_id: applicationId,
            status: "PENDING",
            mission: {
                establishment_id: establishmentId,
            },
        },
        include: {
            worker: {
                select: { user_id: true },
            },
        },
    });

    if (!application) {
        throw new Error("Application not found or not authorized");
    }

    // Transaction : rejet + notification
    await prisma.$transaction([
        prisma.application.update({
            where: { application_id: applicationId },
            data: { status: "REJECTED" },
        }),
        prisma.notification.create({
            data: {
                user_id: application.worker.user_id,
                type: "WARNING",
                message: "Votre candidature a été refusée pour cette mission",
            },
        }),
    ]);

    return { message: "Application rejected successfully" };
};

//--- Worker marks as completed ---//
export const markAsCompletedByWorkerService = async (applicationId, workerId) => {
    const application = await prisma.application.findFirst({
        where: {
            application_id: applicationId,
            worker_profile_id: workerId,
            status: { in: ["ACCEPTED", "IN_PROGRESS"] }, // Can mark as done if accepted or in progress
        },
        include: {
            mission: true,
        }
    });

    if (!application) {
        throw new Error("Application not found or status not valid");
    }

    // Transaction
    await prisma.$transaction([
        prisma.application.update({
            where: { application_id: applicationId },
            data: { status: "COMPLETED_BY_WORKER" },
        }),
        prisma.notification.create({
            data: {
                user_id: application.mission.establishment_id,
                type: "INFO",
                message: `Le worker a marqué la mission "${application.mission.title}" comme terminée. En attente de votre confirmation.`,
            },
        }),
    ]);

    return { message: "Mission marked as completed" };
};

//--- Establishment confirms completion ---//
export const confirmCompletionService = async (applicationId, establishmentId) => {
    const application = await prisma.application.findFirst({
        where: {
            application_id: applicationId,
            status: "COMPLETED_BY_WORKER",
            mission: {
                establishment_id: establishmentId,
            },
        },
        include: {
            worker: { select: { user_id: true } },
            mission: { select: { title: true } }
        }
    });

    if (!application) {
        throw new Error("Application not found or not in correct status");
    }

    // Transaction
    await prisma.$transaction([
        prisma.application.update({
            where: { application_id: applicationId },
            data: { status: "COMPLETED_CONFIRMED" },
        }),
        prisma.mission.update({
            where: { mission_id: application.mission_id },
            data: { status: "COMPLETED" },
        }),
        // Create Intervention record to allow feedback
        prisma.intervention.create({
            data: {
                application_id: applicationId,
            }
        }),
        prisma.notification.create({
            data: {
                user_id: application.worker.user_id,
                type: "SUCCESS",
                message: `L'établissement a confirmé la fin de la mission "${application.mission.title}". Félicitations ! 🎉`,
            },
        }),
    ]);

    return { message: "Completion confirmed successfully" };
};
