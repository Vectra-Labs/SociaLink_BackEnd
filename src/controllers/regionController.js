import * as regionService from "../services/regionService.js";

export const getRegions = async (req, res) => {
  try {
    const regions = await regionService.getRegionsService();
    res.json(regions);
  } catch (error) {
    console.error("GET REGIONS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch regions" });
  }
};
