import {prisma} from "../config/db.js";

  
//--- Accept Application ---//
export const acceptApplication = async (req, res) => {
  try {
    const applicationId = Number(req.params.id);
    const establishmentId = req.user.user_id;

    //  Vérifier que la candidature existe
    //    et qu'elle appartient à une mission de cet établissement
    const application = await prisma.application.findFirst({
      where: {
        application_id: applicationId,
        status: "PENDING",
        mission: {
          establishment_id: establishmentId,
        },
      },
      include: {
        worker: {
          select: { user_id: true },
        },
      },
    });

    if (!application) {
      return res.status(404).json({
        message: "Application not found or not authorized",
      });
    }

    //  Transaction : accepter + notifier le worker
    await prisma.$transaction([
      prisma.application.update({
        where: { application_id: applicationId },
        data: { status: "ACCEPTED" },
      }),
      prisma.notification.create({
        data: {
          user_id: application.worker.user_id,
          type: "SUCCESS",
          message: "Votre candidature a été acceptée 🎉",
        },
      }),
    ]);

    res.status(200).json({
      message: "Application accepted successfully",
    });
  } catch (error) {
    console.error("ACCEPT APPLICATION ERROR:", error);
    res.status(500).json({
      message: "Failed to accept application",
    });
  }
};

//--- Reject Application ---//
export const rejectApplication = async (req, res) => {
  try {
    const applicationId = Number(req.params.id);
    const establishmentId = req.user.user_id;

    // Vérifier que la candidature existe et appartient à une mission de cet établissement
    const application = await prisma.application.findFirst({
      where: {
        application_id: applicationId,
        status: "PENDING",
        mission: {
          establishment_id: establishmentId,
        },
      },
      include: {
        worker: {
          select: { user_id: true },
        },
      },
    });

    if (!application) {
      return res.status(404).json({
        message: "Application not found or not authorized",
      });
    }

    // Transaction : rejet + notification
    await prisma.$transaction([
      prisma.application.update({
        where: { application_id: applicationId },
        data: { status: "REJECTED" },
      }),
      prisma.notification.create({
        data: {
          user_id: application.worker.user_id,
          type: "WARNING",
          message: "Votre candidature a été refusée pour cette mission",
        },
      }),
    ]);

    res.status(200).json({
      message: "Application rejected successfully",
    });
  } catch (error) {
    console.error("REJECT APPLICATION ERROR:", error);
    res.status(500).json({
      message: "Failed to reject application",
    });
  }
};