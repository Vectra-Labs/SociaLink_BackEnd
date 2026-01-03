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


//----------------------------- Add Worker Specialities -----------------------------//
export const addWorkerSpecialities = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { speciality_ids } = req.body;

    //  Vérifier que les spécialités existent
    const existingSpecialities = await prisma.speciality.findMany({
      where: {
        speciality_id: { in: speciality_ids },
      },
      select: { speciality_id: true },
    });

    if (existingSpecialities.length !== speciality_ids.length) {
      return res.status(400).json({
        message: "One or more specialities do not exist",
      });
    }

    //  Éviter les doublons (déjà associées)
    const alreadyLinked = await prisma.workerSpeciality.findMany({
      where: {
        user_id: userId,
        speciality_id: { in: speciality_ids },
      },
      select: { speciality_id: true },
    });

    const alreadyLinkedIds = alreadyLinked.map(
      (item) => item.speciality_id
    );

    const newSpecialities = speciality_ids.filter(
      (id) => !alreadyLinkedIds.includes(id)
    );

    if (newSpecialities.length === 0) {
      return res.status(200).json({
        message: "Specialities already added",
      });
    }

    //  Créer les relations
    await prisma.workerSpeciality.createMany({
      data: newSpecialities.map((specialityId) => ({
        user_id: userId,
        speciality_id: specialityId,
      })),
    });

    res.status(201).json({
      message: "Specialities added successfully",
      added_specialities: newSpecialities,
    });
  } catch (error) {
    console.error("ADD WORKER SPECIALITIES ERROR:", error);
    res.status(500).json({
      message: "Failed to add specialities",
    });
  }
};

//----------------------------- Get Worker Specialities -----------------------------//
export const getWorkerSpecialities = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const workerSpecialities = await prisma.workerSpeciality.findMany({
      where: {
        user_id: userId,
      },
      include: {
        speciality: {
          select: {
            speciality_id: true,
            name: true,
          },
        },
      },
    });

    // Format response to return only speciality details
    const specialities = workerSpecialities.map((item) => ({
      speciality_id: item.speciality.speciality_id,
      name: item.speciality.name,
    }));

    res.status(200).json({
      data: specialities,
    });
  } catch (error) {
    console.error("GET WORKER SPECIALITIES ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch worker specialities",
    });
  }
};


//----------------------------- Remove Worker Speciality -----------------------------//
export const removeWorkerSpeciality = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const specialityId = Number(req.params.id);

    if (isNaN(specialityId)) {
      return res.status(400).json({
        message: "Invalid speciality id",
      });
    }

    // Vérifier si la relation existe
    const existing = await prisma.workerSpeciality.findUnique({
      where: {
        user_id_speciality_id: {
          user_id: userId,
          speciality_id: specialityId,
        },
      },
    });

    if (!existing) {
      return res.status(404).json({
        message: "Speciality not found for this worker",
      });
    }

    // Supprimer la relation
    await prisma.workerSpeciality.delete({
      where: {
        user_id_speciality_id: {
          user_id: userId,
          speciality_id: specialityId,
        },
      },
    });

    res.status(200).json({
      message: "Speciality removed successfully",
    });
  } catch (error) {
    console.error("REMOVE WORKER SPECIALITY ERROR:", error);
    res.status(500).json({
      message: "Failed to remove speciality",
    });
  }
};