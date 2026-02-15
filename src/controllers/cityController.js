import * as cityService from "../services/cityService.js";

export const getCitiesByRegion = async (req, res) => {
  try {
    const { regionId } = req.params;
    const cities = await cityService.getCitiesByRegionService(regionId);
    res.json(cities);
  } catch (error) {
    console.error("GET CITIES BY REGION ERROR:", error);
    res.status(500).json({ message: "Failed to fetch cities" });
  }
};


export const getAllCities = async (req, res) => {
  try {
    const cities = await cityService.getAllCitiesService();

    res.status(200).json({
      data: cities
    });

  } catch (error) {
    console.error("GET CITIES ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch cities"
    });
  }
};

