import {prisma} from "../config/db.js";

export const createMission = async (req, res) => {
  try {
    const userId = req.user.user_id; // establishment
    const {
      title,
      description,
      city_id,
      start_date,
      end_date,
    } = req.body;

    const mission = await prisma.mission.create({
      data: {
        title,
        description,
        city_id,
        start_date,
        end_date,
        establishment_id: userId,
        status: "OPEN",
      },
    });

    res.status(201).json({
      message: "Mission created successfully",
      data: mission,
    });
  } catch (error) {
    console.error("CREATE MISSION ERROR:", error);
    res.status(500).json({ message: "Failed to create mission" });
  }
};


export const applyToMission = async (req, res) => {
  try {
    const missionId = Number(req.params.id);
    const workerId = req.user.user_id;

    const existing = await prisma.application.findFirst({
      where: {
        mission_id: missionId,
        worker_profile_id: workerId,
      },
    });

    if (existing) {
      return res.status(400).json({
        message: "You already applied to this mission",
      });
    }

    await prisma.application.create({
      data: {
        mission_id: missionId,
        worker_profile_id: workerId,
        status: "PENDING",
      },
    });

    res.status(201).json({
      message: "Application submitted successfully",
    });
  } catch (error) {
    console.error("APPLY MISSION ERROR:", error);
    res.status(500).json({ message: "Failed to apply to mission" });
  }
};


export const getMyEstablishmentMissions = async (req, res) => {
  try {
    const establishmentId = req.user.user_id;

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

    res.status(200).json({
      data: result,
    });
  } catch (error) {
    console.error("GET ESTABLISHMENT MISSIONS ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch establishment missions",
    });
  }
};

export const getMissionApplications = async (req, res) => {
  try {
    const missionId = Number(req.params.id);
    const userId = req.user.user_id;

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
          },
        },
      },
    });

    if (!mission) {
      return res.status(404).json({ message: "Mission not found" });
    }

    res.status(200).json({
      data: mission.applications,
    });
  } catch (error) {
    console.error("GET APPLICATIONS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch applications" });
  }
};

