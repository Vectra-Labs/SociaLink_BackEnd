import { prisma } from "../config/db.js";
import { supabase } from "../config/supabase.js";

//----------------------------- Search Workers -----------------------------//
export const searchWorkersService = async ({ speciality_id, search, min_experience, verified_only }) => {
    const specId = speciality_id ? Number(speciality_id) : null;

    const workers = await prisma.workerProfile.findMany({
        where: {
            // Si verified_only est 'true', on ne prend que les VERIFIED. 
            // Sinon, on prend tout (ou on peut garder VERIFIED par défaut selon le besoin métier)
            ...(verified_only === 'true' ? { verification_status: "VERIFIED" } : {}),

            ...(min_experience && {
                experience_years: {
                    gte: Number(min_experience)
                }
            }),

            ...(search && {
                OR: [
                    { first_name: { contains: search, mode: "insensitive" } },
                    { last_name: { contains: search, mode: "insensitive" } },
                    { bio: { contains: search, mode: "insensitive" } },
                ],
            }),
            ...(specId && !isNaN(specId) && {
                specialities: {
                    some: {
                        speciality_id: specId,
                    },
                },
            }),
        },
        include: {
            specialities: {
                include: {
                    speciality: true,
                },
            },
            city: true,
            user: {
                select: {
                    email: true
                }
            }
        },
    });

    return workers.map(w => ({
        user_id: w.user_id,
        first_name: w.first_name,
        last_name: w.last_name,
        title: w.title,
        experience_years: w.experience_years,
        bio: w.bio,
        city: w.city?.name,
        profile_pic_url: w.profile_pic_url,
        specialities: w.specialities.map(s => s.speciality.name)
    }));
};

//----------------------------- Get Worker By ID (for Establishment) -----------------------------//
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
            city: true
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
            city: worker.city?.name,
            experience_years: worker.experience_years,
            title: worker.title,
            cv_download_url: worker.cv_url ? `${process.env.API_URL || "http://localhost:3000"}/api/worker/cv/download/${worker.user_id}` : null,
            cv_filename: worker.cv_url ? "CV.pdf" : null,
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

//----------------------------- Get My Profile (for current Establishment) -----------------------------//
export const getMyProfileService = async (userId) => {
    const establishment = await prisma.establishmentProfile.findUnique({
        where: { user_id: userId },
        include: {
            city: true,
            structure: true,
            user: {
                select: {
                    email: true
                }
            }
        }
    });

    if (!establishment) {
        throw new Error("Establishment profile not found");
    }

    return establishment;
};

//----------------------------- Update My Profile (for current Establishment) -----------------------------//
export const updateMyProfileService = async (userId, bodyData, file) => {
    const dataToUpdate = { ...bodyData };

    // Nettoyage des données
    delete dataToUpdate.user_id;
    delete dataToUpdate.verification_status;
    delete dataToUpdate.user; // Fix: Remove user object to avoid Prisma relation error
    delete dataToUpdate.logo; // Fix: Remove logo field (handled via file upload)

    // Coerce numeric fields
    if (dataToUpdate.city_id) {
        dataToUpdate.city = {
            connect: { city_id: Number(dataToUpdate.city_id) }
        };
        delete dataToUpdate.city_id;
    }

    // Fetch current profile for cleanup
    const currentProfile = await prisma.establishmentProfile.findUnique({
        where: { user_id: userId },
        select: { logo_url: true }
    });

    // Upload logo if exists
    if (file) {
        const fileExt = file.mimetype.split("/")[1] || "png";
        const fileName = `establishment_${userId}_${Date.now()}.${fileExt}`;

        // 1. Upload new
        const { error: uploadError } = await supabase.storage
            .from("avatars")
            .upload(fileName, file.buffer, {
                contentType: file.mimetype,
                cacheControl: "3600",
                upsert: true,
            });

        if (uploadError) {
            throw new Error("Failed to upload logo to storage");
        }

        // 2. Get URL
        const { data: urlData } = supabase.storage
            .from("avatars")
            .getPublicUrl(fileName);

        dataToUpdate.logo_url = urlData.publicUrl;

        // 3. Cleanup old
        if (currentProfile?.logo_url) {
            try {
                const oldFileName = currentProfile.logo_url.split("/").pop();
                if (oldFileName) {
                    await supabase.storage.from("avatars").remove([oldFileName]);
                }
            } catch (cleanupErr) {
                console.warn("Could not delete old logo from Supabase:", cleanupErr);
            }
        }
    }

    const updatedProfile = await prisma.establishmentProfile.update({
        where: { user_id: userId },
        data: dataToUpdate
    });

    return updatedProfile;
};

//----------------------------- Get Establishment Notifications -----------------------------//
export const getEstablishmentNotificationsService = async (userId) => {
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

//----------------------------- Mark Establishment Notification as Read -----------------------------//
export const markEstablishmentNotificationAsReadService = async (userId, notificationId) => {
    const notification = await prisma.notification.findFirst({
        where: {
            notification_id: notificationId,
            user_id: userId,
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


export const markAllEstablishmentNotificationsAsReadService = async (userId) => {
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

//----------------------------- Get Establishment Stats (Dashboard) -----------------------------//
export const getEstablishmentStatsService = async (userId) => {
    // Execute all queries in parallel for better performance
    const [activeMissionsCount, pendingApplicationsCount, recentApplications] = await Promise.all([

        // 1. Missions Actives (assuming PENDING = Open for applications based on missionController)
        prisma.mission.count({
            where: {
                establishment_id: userId,
                status: "PENDING",
            },
        }),

        // 2. Candidatures en attente
        prisma.application.count({
            where: {
                mission: {
                    establishment_id: userId,
                },
                status: "PENDING",
            },
        }),

        // 3. Application Récentes (Limit 5)
        prisma.application.findMany({
            where: {
                mission: {
                    establishment_id: userId,
                },
            },
            take: 5,
            orderBy: {
                created_at: "desc",
            },
            include: {
                worker: {
                    select: {
                        first_name: true,
                        last_name: true,
                        experience_years: true,
                        title: true, // Poste actuel du worker (si pertinent)
                        profile_pic_url: true,
                        user: {
                            select: {
                                user_id: true,
                            }
                        }
                    },
                },
                mission: {
                    select: {
                        title: true, // Poste visé = Titre de la mission
                    },
                },
            },
        })
    ]);

    // Format recent apps
    const formattedRecentApps = recentApplications.map((app) => ({
        application_id: app.application_id,
        worker_name: `${app.worker.first_name} ${app.worker.last_name}`,
        worker_exp: app.worker.experience_years,
        worker_pic: app.worker.profile_pic_url,
        worker_id: app.worker.user.user_id,
        mission_title: app.mission.title,
        status: app.status,
        date: app.created_at,
    }));

    return {
        activeMissionsCount,
        pendingApplicationsCount,
        recentApplications: formattedRecentApps,
    };
};
