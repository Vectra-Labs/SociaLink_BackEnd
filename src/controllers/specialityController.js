import {prisma} from "../config/db.js";

//----------------------------- Get All Specialities -----------------------------//
export const getAllSpecialities = async (req, res) => {
  try {
    const specialities = await prisma.speciality.findMany({
      orderBy: {
        name: "asc",
      },
    });

    res.status(200).json({
      data: specialities,
    });
  } catch (error) {
    console.error("GET SPECIALITIES ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch specialities",
    });
  }
};


