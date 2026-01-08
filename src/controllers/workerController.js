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

//----------------------------- Submit Worker Profile for Review -----------------------------//
export const submitWorkerProfile = async (req, res) => {
  try {
    const userId = req.user.user_id;

    //  Vérifier le profil worker
    const workerProfile = await prisma.workerProfile.findUnique({
      where: { user_id: userId },
      include: {
        diplomas: true,
        specialities: true,
      },
    });

    if (!workerProfile) {
      return res.status(404).json({
        message: "Worker profile not found",
      });
    }

    //  Empêcher double soumission
    if (workerProfile.verification_status !== "PENDING") {
      return res.status(400).json({
        message: "Profile already submitted or reviewed",
      });
    }

    //  Vérifications métier minimales
    if (workerProfile.specialities.length === 0) {
      return res.status(400).json({
        message: "At least one speciality is required",
      });
    }

    if (workerProfile.diplomas.length === 0) {
      return res.status(400).json({
        message: "At least one diploma is required",
      });
    }

    //  Trouver un ADMIN 
    const admin = await prisma.user.findFirst({
      where: { role: "ADMIN" },
      select: { user_id: true },
    });
    if (!admin) {
      return res.status(500).json({
        message: "No admin found to notify",
      });
    }

    // Transaction : update + notification
    await prisma.$transaction([
      prisma.workerProfile.update({
        where: { user_id: userId },
        data: {
          verification_status: "UNDER_REVIEW",
        },
      }),
      prisma.notification.create({
        data: {
          user_id: admin.user_id,
          type: "INFO",
          message: "Un nouveau travailleur a soumis son profil pour validation",
        },
      }),
    ]);

    res.status(200).json({
      message: "Profile submitted successfully. Awaiting admin review.",
    });
  } catch (error) {
    console.error("SUBMIT WORKER PROFILE ERROR:", error);
    res.status(500).json({
      message: "Failed to submit worker profile",
    });
  }

};

//----------------------------- Get Worker Profile -----------------------------//
export const getWorkerProfile = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const worker = await prisma.workerProfile.findUnique({
      where: { user_id: userId },
      include: {
        user: {
          select: {
            user_id: true,
            email: true,
            role: true,
          },
        },
        specialities: {
          include: {
            speciality: {
              select: {
                speciality_id: true,
                name: true,
              },
            },
          },
        },
        diplomas: {
          select: {
            diploma_id: true,
            name: true,
            institution: true,
            verification_status: true,
            created_at: true,
          },
        },
      },
    });

    if (!worker) {
      return res.status(404).json({
        message: "Worker profile not found",
      });
    }

    // Format pour le frontend
    const response = {
      user: worker.user,
      profile: {
        first_name: worker.first_name,
        last_name: worker.last_name,
        phone: worker.phone,
        bio: worker.bio,
        profile_pic_url: worker.profile_pic_url,
        verification_status: worker.verification_status,
      },
      specialities: worker.specialities.map((s) => ({
        speciality_id: s.speciality.speciality_id,
        name: s.speciality.name,
      })),
      diplomas: worker.diplomas,
    };

    res.status(200).json({ data: response });
  } catch (error) {
    console.error("GET MY WORKER PROFILE ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch worker profile",
    });
  }
};

//----------------------------- Get Worker Notifications -----------------------------//
export const getWorkerNotifications = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const notifications = await prisma.notification.findMany({
      where: {
        user_id: userId,
      },
      orderBy: {
        created_at: "desc",
      },
      select: {
        notification_id: true,
        message: true,
        type: true,
        is_read: true,
        created_at: true,
      },
    });

    res.status(200).json({
      data: notifications,
    });
  } catch (error) {
    console.error("GET WORKER NOTIFICATIONS ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch notifications",
    });
  }
};