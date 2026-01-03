import {prisma} from "../config/db.js";
import { supabase } from "../config/supabase.js";

//----------------------------- Update Worker Profile -----------------------------//
export const updateWorkerProfile = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const dataToUpdate = { ...req.body };

    // Upload photo if exists
    if (req.file) {
      const fileName = `worker_${userId}_${Date.now()}.png`;

      const { error } = await supabase.storage
        .from("avatars")
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: true,
        });

      if (error) throw error;

      const { data } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      dataToUpdate.profile_pic_url = data.publicUrl;
    }

    const updatedProfile = await prisma.workerProfile.update({
      where: { user_id: userId },
      data: dataToUpdate,
    });

    res.status(200).json({
      message: "Profile updated successfully",
      data: updatedProfile,
    });
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);
    res.status(500).json({
      message: "Failed to update profile",
    });
  }
};