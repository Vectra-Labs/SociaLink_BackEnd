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


