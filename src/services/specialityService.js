import { prisma } from "../config/db.js";

//----------------------------- Get All Specialities -----------------------------//
export const getAllSpecialitiesService = async () => {
    const specialities = await prisma.speciality.findMany({
        orderBy: {
            name: "asc",
        },
    });
    return specialities;
};
