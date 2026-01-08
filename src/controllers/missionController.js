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