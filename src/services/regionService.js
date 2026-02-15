import { prisma } from "../config/db.js";

export const getRegionsService = async () => {
    const regions = await prisma.region.findMany({
        orderBy: { name: "asc" }
    });
    return regions;
};
