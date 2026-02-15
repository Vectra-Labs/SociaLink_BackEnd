import * as diplomaService from "../services/diplomaService.js";

//----------------------------- Upload Diploma -----------------------------//
export const uploadDiploma = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const responseData = await diplomaService.uploadDiplomaService(userId, req.body, req.file);

    res.status(201).json({
      message: "Diploma uploaded successfully",
      data: responseData,
    });

  } catch (error) {
    console.error("UPLOAD DIPLOMA ERROR:", error);
    res.status(500).json({
      message: "Failed to upload diploma",
      error: error.message,
    });
  }
};

//----------------------------- Delete Diploma -----------------------------//
export const deleteDiploma = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const diplomaId = Number(req.params.id);

    const result = await diplomaService.deleteDiplomaService(userId, diplomaId);

    res.status(200).json(result);
  } catch (error) {
    console.error("DELETE DIPLOMA ERROR:", error);
    let status = 500;
    if (error.message === "Diploma not found or not authorized") status = 404;
    if (error.message === "Cannot delete a verified diploma") status = 400;

    res.status(status).json({
      message: error.message || "Failed to delete diploma",
    });
  }
};

//----------------------------- Download Diploma -----------------------------//
export const downloadDiploma = async (req, res) => {
  try {
    const diplomaId = Number(req.params.id);
    const requestorId = req.user.user_id;
    const requestorRole = req.user.role;

    const result = await diplomaService.downloadDiplomaService(diplomaId, requestorId, requestorRole);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${result.filename}"`);
    res.send(result.buffer);

  } catch (error) {
    console.error("DOWNLOAD DIPLOMA ERROR:", error);
    let status = 500;
    if (error.message === "Diploma not found" || error.message === "File path missing") status = 404;
    if (error.message === "Access denied") status = 403;

    res.status(status).json({ message: error.message || "Failed to download diploma" });
  }
};
