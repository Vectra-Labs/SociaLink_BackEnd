import { prisma } from "../config/db.js";

//----------------------------- Get Admin Notifications -----------------------------//
export const getAdminNotificationsService = async (adminId) => {
    const notifications = await prisma.notification.findMany({
        where: {
            user_id: adminId,
        },
        orderBy: {
            created_at: "desc",
        },
        select: {
            notification_id: true,
            message: true,
            type: true,
            is_read: true,
            created_at: true,
        },
    });
    return notifications;
};

//----------------------------- Get Workers Under Review -----------------------------//
export const getWorkersUnderReviewService = async () => {
    const workers = await prisma.workerProfile.findMany({
        where: { verification_status: "PENDING" },
        include: {
            user: {
                select: {
                    user_id: true,
                    email: true,
                },
            },
        },
    });
    return workers;
};

//----------------------------- Approve Worker Verification -----------------------------//
export const approveWorkerService = async (workerId) => {
    await prisma.$transaction([
        prisma.workerProfile.update({
            where: { user_id: workerId },
            data: { verification_status: "VERIFIED" },
        }),
        prisma.notification.create({
            data: {
                user_id: workerId,
                type: "SUCCESS",
                message: "Votre profil a été validé par administrateur",
            },
        }),
    ]);
    return { message: "Worker approved successfully" };
};

//----------------------------- Reject Worker Verification -----------------------------//
export const rejectWorkerService = async (workerId, reason) => {
    if (!reason) {
        throw new Error("Rejection reason is required");
    }

    await prisma.$transaction([
        prisma.workerProfile.update({
            where: { user_id: workerId },
            data: { verification_status: "REJECTED" },
        }),
        prisma.notification.create({
            data: {
                user_id: workerId,
                type: "WARNING",
                message: `Profil refusé : ${reason}`,
            },
        }),
    ]);
    return { message: "Worker rejected successfully" };
};

//----------------------------- Mark Notification as Read -----------------------------//
export const markNotificationAsReadService = async (adminId, notificationId) => {
    const notification = await prisma.notification.findFirst({
        where: {
            notification_id: notificationId,
            user_id: adminId, // sécurité
        },
    });

    if (!notification) {
        throw new Error("Notification not found");
    }

    await prisma.notification.update({
        where: { notification_id: notificationId },
        data: { is_read: true },
    });
    return { message: "Notification marked as read" };
};

//----------------------------- Mark All Notifications as Read -----------------------------//
export const markAllNotificationsAsReadService = async (adminId) => {
    await prisma.notification.updateMany({
        where: {
            user_id: adminId,
            is_read: false,
        },
        data: {
            is_read: true,
        },
    });
    return { message: "All notifications marked as read" };
};

//----------------------------- Get Worker by ID -----------------------------//
export const getWorkerByIdService = async (workerId) => {
    const worker = await prisma.workerProfile.findUnique({
        where: { user_id: workerId },
        include: {
            user: {
                select: {
                    user_id: true,
                    email: true,
                    role: true,
                    created_at: true,
                },
            },
            specialities: {
                include: {
                    speciality: {
                        select: {
                            speciality_id: true,
                            name: true,
                        },
                    },
                },
            },
            diplomas: {
                select: {
                    diploma_id: true,
                    name: true,
                    institution: true,
                    verification_status: true,
                    file_url: true,
                    created_at: true,
                },
            },
        },
    });

    if (!worker) {
        throw new Error("Worker not found");
    }

    return {
        user: worker.user,
        profile: {
            first_name: worker.first_name,
            last_name: worker.last_name,
            phone: worker.phone,
            bio: worker.bio,
            profile_pic_url: worker.profile_pic_url,
            verification_status: worker.verification_status,
        },
        specialities: worker.specialities.map((s) => ({
            speciality_id: s.speciality.speciality_id,
            name: s.speciality.name,
        })),
        diplomas: worker.diplomas.map(d => ({
            ...d,
            file_url: `${process.env.API_URL || "http://localhost:3000"}/api/diplomas/${d.diploma_id}/download`
        })),
    };
};

//----------------------------- Get Admin Statistics -----------------------------//
export const getAdminStatsService = async () => {
    // 1. Profils à valider (PENDING)
    const pendingProfilesCount = await prisma.workerProfile.count({
        where: { verification_status: "PENDING" },
    });

    // 2. Profils vérifiés
    const verifiedProfilesCount = await prisma.workerProfile.count({
        where: { verification_status: "VERIFIED" },
    });

    // 3. Litiges (Applications avec status DISPUTED)
    const disputedMissionsCount = await prisma.application.count({
        where: { status: "DISPUTED" },
    });

    // 4. Score Qualité (Average Rating from Feedbacks)
    const feedbacks = await prisma.feedback.aggregate({
        _avg: {
            rating: true,
        },
    });

    const averageRating = feedbacks._avg.rating ? parseFloat(feedbacks._avg.rating.toFixed(1)) : 0;
    const qualityScore = Math.round(averageRating * 20); // Map 0-5 to 0-100

    return {
        pendingProfiles: pendingProfilesCount,
        verifiedProfiles: verifiedProfilesCount,
        disputedMissions: disputedMissionsCount,
        qualityScore: qualityScore,
    };
};
