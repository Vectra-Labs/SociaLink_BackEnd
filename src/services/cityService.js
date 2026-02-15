import { prisma } from "../config/db.js";

export const getCitiesByRegionService = async (regionId) => {
    const cities = await prisma.city.findMany({
        where: {
            region_id: Number(regionId)
        },
        orderBy: {
            name: "asc"
        }
    });
    return cities;
};

export const getAllCitiesService = async () => {
    const cities = await prisma.city.findMany({
        orderBy: {
            name: "asc"
        },
        select: {
            city_id: true,
            name: true
        }
    });
    return cities;
};
