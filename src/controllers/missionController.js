import * as missionService from "../services/missionService.js";

//----------------------------- Create Mission -----------------------------//
export const createMission = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const mission = await missionService.createMissionService(userId, req.body);

    res.status(201).json({
      message: "Mission created successfully",
      data: mission,
    });

  } catch (error) {
    console.error("CREATE MISSION ERROR:", error);
    res.status(error.message === "Veuillez sélectionner au moins une spécialité" ? 400 : 500).json({
      message: error.message || "Failed to create mission",
    });
  }
};


//----------------------------- Get Public Missions -----------------------------//
export const getPublicMissions = async (req, res) => {
  try {
    const missions = await missionService.getPublicMissionsService(req.query);
    res.status(200).json({
      data: missions,
    });
  } catch (error) {
    console.error("GET PUBLIC MISSIONS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch missions" });
  }
};



//----------------------------- Apply to Mission -----------------------------//
export const applyToMission = async (req, res) => {
  try {
    const missionId = Number(req.params.id);
    const workerId = req.user.user_id;

    const result = await missionService.applyToMissionService(workerId, missionId);

    res.status(201).json(result);
  } catch (error) {
    console.error("APPLY MISSION ERROR:", error);
    let status = 500;
    if (error.message === "You already applied to this mission") status = 400;
    if (error.message === "Mission not found") status = 404;
    res.status(status).json({ message: error.message || "Failed to apply to mission" });
  }
};


//----------------------------- Get My Establishment Missions -----------------------------//
export const getMyEstablishmentMissions = async (req, res) => {
  try {
    const establishmentId = req.user.user_id;
    const result = await missionService.getMyEstablishmentMissionsService(establishmentId);

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

//----------------------------- Get Mission Applications -----------------------------//
export const getMissionApplications = async (req, res) => {
  try {
    const missionId = Number(req.params.id);
    const userId = req.user.user_id;

    const applications = await missionService.getMissionApplicationsService(missionId, userId);

    res.status(200).json({
      data: applications,
    });
  } catch (error) {
    console.error("GET APPLICATIONS ERROR:", error);
    res.status(error.message === "Mission not found" ? 404 : 500).json({ message: error.message || "Failed to fetch applications" });
  }
};

