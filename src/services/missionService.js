import { prisma } from "../config/db.js";

//----------------------------- Create Mission -----------------------------//
export const createMissionService = async (userId, data) => {
    const {
        title,
        description,
        budget,
        city_id,
        start_date,
        end_date,
        speciality_ids
    } = data;

    // Security check
    if (!speciality_ids || speciality_ids.length === 0) {
        throw new Error("Veuillez sélectionner au moins une spécialité");
    }

    const mission = await prisma.mission.create({
        data: {
            title,
            description,
            budget: Number(budget),
            city_id: Number(city_id),
            start_date: new Date(start_date),
            end_date: new Date(end_date),
            establishment_id: userId,
            status: "PENDING",

            // MANY TO MANY LINK
            specialities: {
                createMany: {
                    data: speciality_ids.map((id) => ({
                        speciality_id: Number(id),
                    })),
                },
            },

        },
        include: {
            specialities: {
                include: {
                    speciality: true,
                },
            },
        },
    });

    return mission;
};

//----------------------------- Get Public Missions -----------------------------//
export const getPublicMissionsService = async ({ search, speciality_id }) => {
    const specId = speciality_id ? Number(speciality_id) : null;

    const missions = await prisma.mission.findMany({
        where: {
            status: "PENDING",

            ...(search && {
                title: {
                    contains: search,
                    mode: "insensitive",
                },
            }),

            ...(specId && !isNaN(specId) && {
                specialities: {
                    some: {
                        speciality_id: specId,
                    },
                },
            }),
        },

        orderBy: {
            created_at: "desc",
        },

        include: {
            city: {
                select: {
                    city_id: true,
                    name: true,
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
        },
    });

    return missions;
};

//----------------------------- Apply to Mission -----------------------------//
export const applyToMissionService = async (userId, missionId) => {
    const existing = await prisma.application.findFirst({
        where: {
            mission_id: missionId,
            worker_profile_id: userId,
        },
    });

    if (existing) {
        throw new Error("You already applied to this mission");
    }

    // 1. Get Mission details to find Establishment ID
    const mission = await prisma.mission.findUnique({
        where: { mission_id: missionId },
        include: {
            establishment: {
                select: { user_id: true }
            }
        }
    });

    if (!mission) {
        throw new Error("Mission not found");
    }

    const estUserId = mission.establishment_id;

    // 2. Create Application & Notifications in transaction
    await prisma.$transaction([
        prisma.application.create({
            data: {
                mission_id: missionId,
                worker_profile_id: userId,
                status: "PENDING",
            },
        }),
        // Notification for Establishment
        prisma.notification.create({
            data: {
                user_id: estUserId,
                type: "INFO",
                message: `Nouvelle candidature reçue pour : ${mission.title}`,
            }
        }),
        // Notification for Worker (Confirmation)
        prisma.notification.create({
            data: {
                user_id: userId,
                type: "SUCCESS",
                message: `Votre candidature pour "${mission.title}" a bien été enregistrée.`,
            }
        })
    ]);

    return { message: "Application submitted successfully" };
};

//----------------------------- Get My Establishment Missions -----------------------------//
export const getMyEstablishmentMissionsService = async (establishmentId) => {
    const missions = await prisma.mission.findMany({
        where: {
            establishment_id: establishmentId,
        },
        orderBy: {
            created_at: "desc",
        },
        include: {
            city: {
                select: {
                    city_id: true,
                    name: true,
                },
            },
            applications: {
                select: {
                    application_id: true,
                    status: true,
                },
            },
        },
    });

    const result = missions.map((mission) => ({
        mission_id: mission.mission_id,
        title: mission.title,
        description: mission.description,
        budget: mission.budget, // Added budget field
        start_date: mission.start_date,
        end_date: mission.end_date,
        status: mission.status,
        city: mission.city,
        applications_count: mission.applications.length,
        applications_status: {
            pending: mission.applications.filter(
                (a) => a.status === "PENDING"
            ).length,
            accepted: mission.applications.filter(
                (a) => a.status === "ACCEPTED"
            ).length,
            rejected: mission.applications.filter(
                (a) => a.status === "REJECTED"
            ).length,
        },
    }));

    return result;
};

//----------------------------- Get Mission Applications -----------------------------//
export const getMissionApplicationsService = async (missionId, userId) => {
    const mission = await prisma.mission.findFirst({
        where: {
            mission_id: missionId,
            establishment_id: userId,
        },
        include: {
            applications: {
                include: {
                    worker: {
                        include: {
                            user: { select: { email: true } },
                        },
                    },
                    intervention: {
                        include: {
                            feedbacks: true
                        }
                    }
                },
            },
        },
    });

    if (!mission) {
        throw new Error("Mission not found");
    }

    return mission.applications;
};
