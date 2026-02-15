import { prisma } from "../config/db.js";
import { supabase } from "../config/supabase.js";
import { encryptBuffer, decryptBuffer } from "../utils/encryption.js";

//----------------------------- Update Worker Profile -----------------------------//
export const updateWorkerProfileService = async (userId, bodyData, files) => {
    const dataToUpdate = { ...bodyData };

    // Nettoyage des données
    delete dataToUpdate.user_id;
    delete dataToUpdate.verification_status;

    // Fetch current profile to get old photo/cv URLs if they exist
    const currentProfile = await prisma.workerProfile.findUnique({
        where: { user_id: userId },
        select: { profile_pic_url: true, cv_url: true }
    });

    // 1. Handle Photo Upload
    if (files?.photo) {
        const file = files.photo[0];
        const fileExt = file.mimetype.split("/")[1] || "png";
        const fileName = `worker_${userId}_photo_${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from("avatars")
            .upload(fileName, file.buffer, {
                contentType: file.mimetype,
                cacheControl: "3600",
                upsert: true,
            });

        if (uploadError) throw new Error("Failed to upload photo");

        const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(fileName);
        dataToUpdate.profile_pic_url = urlData.publicUrl;

        // Cleanup old photo
        if (currentProfile?.profile_pic_url) {
            try {
                const oldFileName = currentProfile.profile_pic_url.split("/").pop();
                if (oldFileName) await supabase.storage.from("avatars").remove([oldFileName]);
            } catch (e) { console.warn("Old photo cleanup failed", e); }
        }
    }

    // 2. Handle CV Upload (PDF - Encrypted & Private)
    if (files?.cv) {
        const file = files.cv[0];

        // Encryption
        const { encryptedData } = encryptBuffer(file.buffer);
        const fileName = `worker_${userId}/cv_${Date.now()}.enc`;

        const { error: uploadError } = await supabase.storage
            .from("diplomas") // Using private diplomas bucket
            .upload(fileName, encryptedData, {
                contentType: "application/octet-stream",
                upsert: true,
            });

        if (uploadError) throw new Error("Failed to upload CV");

        // Save the internal path
        dataToUpdate.cv_url = fileName;

        // Cleanup old CV (check if it was in 'avatars' or 'diplomas')
        if (currentProfile?.cv_url) {
            try {
                const oldPath = currentProfile.cv_url;
                // If it's a full URL (old format), extract filename from avatars
                if (oldPath.startsWith("http")) {
                    const oldFileName = oldPath.split("/").pop();
                    if (oldFileName) await supabase.storage.from("avatars").remove([oldFileName]);
                } else {
                    // New format: internal path in diplomas
                    await supabase.storage.from("diplomas").remove([oldPath]);
                }
            } catch (e) { console.warn("Old CV cleanup failed", e); }
        }
    }

    const updatedProfile = await prisma.workerProfile.update({
        where: { user_id: userId },
        data: dataToUpdate,
    });

    return updatedProfile;
};


//----------------------------- Add Worker Specialities -----------------------------//
export const addWorkerSpecialitiesService = async (userId, speciality_ids) => {
    //  Vérifier que les spécialités existent
    const existingSpecialities = await prisma.speciality.findMany({
        where: {
            speciality_id: { in: speciality_ids },
        },
        select: { speciality_id: true },
    });

    if (existingSpecialities.length !== speciality_ids.length) {
        throw new Error("One or more specialities do not exist");
    }

    //  Éviter les doublons (déjà associées)
    const alreadyLinked = await prisma.workerSpeciality.findMany({
        where: {
            user_id: userId,
            speciality_id: { in: speciality_ids },
        },
        select: { speciality_id: true },
    });

    const alreadyLinkedIds = alreadyLinked.map(
        (item) => item.speciality_id
    );

    const newSpecialities = speciality_ids.filter(
        (id) => !alreadyLinkedIds.includes(id)
    );

    if (newSpecialities.length === 0) {
        return { message: "Specialities already added", added_specialities: [] };
    }

    //  Créer les relations
    await prisma.workerSpeciality.createMany({
        data: newSpecialities.map((specialityId) => ({
            user_id: userId,
            speciality_id: specialityId,
        })),
    });

    return {
        message: "Specialities added successfully",
        added_specialities: newSpecialities,
    };
};

//----------------------------- Get Worker Specialities -----------------------------//
export const getWorkerSpecialitiesService = async (userId) => {
    const workerSpecialities = await prisma.workerSpeciality.findMany({
        where: {
            user_id: userId,
        },
        include: {
            speciality: {
                select: {
                    speciality_id: true,
                    name: true,
                },
            },
        },
    });

    // Format response to return only speciality details
    return workerSpecialities.map((item) => ({
        speciality_id: item.speciality.speciality_id,
        name: item.speciality.name,
    }));
};


//----------------------------- Remove Worker Speciality -----------------------------//
export const removeWorkerSpecialityService = async (userId, specialityId) => {
    if (isNaN(specialityId)) {
        throw new Error("Invalid speciality id");
    }

    // Vérifier si la relation existe
    const existing = await prisma.workerSpeciality.findUnique({
        where: {
            user_id_speciality_id: {
                user_id: userId,
                speciality_id: specialityId,
            },
        },
    });

    if (!existing) {
        throw new Error("Speciality not found for this worker"); // Or 404
    }

    // Supprimer la relation
    await prisma.workerSpeciality.delete({
        where: {
            user_id_speciality_id: {
                user_id: userId,
                speciality_id: specialityId,
            },
        },
    });

    return { message: "Speciality removed successfully" };
};

//----------------------------- Submit Worker Profile for Review -----------------------------//
export const submitWorkerProfileService = async (userId) => {
    //  Vérifier le profil worker
    const workerProfile = await prisma.workerProfile.findUnique({
        where: { user_id: userId },
        include: {
            diplomas: true,
            specialities: true,
        },
    });

    if (!workerProfile) {
        throw new Error("Worker profile not found");
    }

    //  Empêcher double soumission
    if (workerProfile.verification_status !== "PENDING") {
        throw new Error("Profile already submitted or reviewed");
    }

    //  Vérifications métier minimales
    if (workerProfile.specialities.length === 0) {
        throw new Error("At least one speciality is required");
    }

    if (workerProfile.diplomas.length === 0) {
        throw new Error("At least one diploma is required");
    }

    //  Trouver un ADMIN 
    const admin = await prisma.user.findFirst({
        where: { role: "ADMIN" },
        select: { user_id: true },
    });

    if (!admin) {
        throw new Error("No admin found to notify");
    }

    // Transaction : update + notification
    await prisma.$transaction([
        prisma.workerProfile.update({
            where: { user_id: userId },
            data: {
                verification_status: "PENDING",
            },
        }),
        prisma.notification.create({
            data: {
                user_id: admin.user_id,
                type: "INFO",
                message: "Un nouveau travailleur a soumis son profil pour validation",
            },
        }),
    ]);

    return { message: "Profile submitted successfully. Awaiting admin review." };
};

//----------------------------- Get Worker Profile -----------------------------//
export const getWorkerProfileService = async (userId) => {
    const worker = await prisma.workerProfile.findUnique({
        where: { user_id: userId },
        include: {
            user: {
                select: {
                    user_id: true,
                    email: true,
                    role: true,
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
                    created_at: true,
                },
            },
        },
    });

    if (!worker) {
        throw new Error("Worker profile not found");
    }

    // Format pour le frontend
    const response = {
        user: worker.user,
        profile: {
            first_name: worker.first_name,
            last_name: worker.last_name,
            phone: worker.phone,
            bio: worker.bio,
            profile_pic_url: worker.profile_pic_url,
            experience_years: worker.experience_years,
            verification_status: worker.verification_status,
            cv_download_url: worker.cv_url ? `${process.env.API_URL || "http://localhost:3000"}/api/worker/cv/download` : null,
            cv_filename: worker.cv_url ? "CV.pdf" : null,
        },
        specialities: worker.specialities.map((s) => ({
            speciality_id: s.speciality.speciality_id,
            name: s.speciality.name,
        })),
        diplomas: worker.diplomas,
    };

    return response;
};

//----------------------------- Get Worker Notifications -----------------------------//
export const getWorkerNotificationsService = async (userId) => {
    const notifications = await prisma.notification.findMany({
        where: {
            user_id: userId,
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

//----------------------------- Mark Worker Notification as Read -----------------------------//
export const markWorkerNotificationAsReadService = async (userId, notificationId) => {
    // Vérifier que la notification appartient bien au worker
    const notification = await prisma.notification.findFirst({
        where: {
            notification_id: notificationId,
            user_id: userId,
        },
    });

    if (!notification) {
        throw new Error("Notification not found");
    }

    // Marquer comme lue
    await prisma.notification.update({
        where: { notification_id: notificationId },
        data: { is_read: true },
    });

    return { message: "Notification marked as read" };
};


export const markAllWorkerNotificationsAsReadService = async (userId) => {
    await prisma.notification.updateMany({
        where: {
            user_id: userId,
            is_read: false,
        },
        data: {
            is_read: true,
        },
    });

    return { message: "All notifications marked as read" };
};

//----------------------------- Get My Missions -----------------------------//
export const getMyMissionsService = async (userId) => {
    const applications = await prisma.application.findMany({
        where: {
            worker_profile_id: userId,
        },
        orderBy: {
            created_at: "desc",
        },
        include: {
            mission: {
                include: {
                    establishment: {
                        select: {
                            user_id: true,
                            name: true,
                        },
                    },
                    city: {
                        select: {
                            city_id: true,
                            name: true,
                        },
                    },
                },
            },
        },
    });

    const result = applications.map((app) => ({
        application_id: app.application_id,
        status: app.status,
        applied_at: app.created_at,
        mission: {
            mission_id: app.mission.mission_id,
            title: app.mission.title,
            description: app.mission.description,
            start_date: app.mission.start_date,
            end_date: app.mission.end_date,
            city: app.mission.city,
            establishment: app.mission.establishment,
        },
    }));

    return result;
};

//----------------------------- Download CV (Secured) -----------------------------//
export const downloadCVService = async (userId, requestorRole, targetUserId) => {
    if (requestorRole !== "ADMIN" && requestorRole !== "ESTABLISHMENT" && userId !== targetUserId) {
        throw new Error("Access denied");
    }

    const worker = await prisma.workerProfile.findUnique({
        where: { user_id: targetUserId },
        select: { cv_url: true }
    });

    if (!worker || !worker.cv_url) {
        throw new Error("CV not found");
    }

    // Security: check format (internal path or old URL)
    if (worker.cv_url.startsWith("http")) {
        return { type: "url", url: worker.cv_url };
    }

    // Download from Supabase (diplomas bucket)
    const { data: fileBlob, error } = await supabase.storage
        .from("diplomas")
        .download(worker.cv_url);

    if (error) throw error;

    const arrayBuffer = await fileBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Decrypt
    const decryptedPdf = decryptBuffer(buffer);

    return { type: "buffer", buffer: decryptedPdf, filename: `cv_${targetUserId}.pdf` };
};
