import {prisma} from "../config/db.js";


export const getAdminNotifications = async (req, res) => {
  try {
    const adminId = req.user.user_id;

    const notifications = await prisma.notification.findMany({
      where: {
        user_id: adminId,
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
    console.error("GET ADMIN NOTIFICATIONS ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch notifications",
    });
  }
};



//----------------------------- Get Workers Under Review -----------------------------//
export const getWorkersUnderReview = async (req, res) => {
  try {
    const workers = await prisma.workerProfile.findMany({
      where: { verification_status: "UNDER_REVIEW" },
      include: {
        user: {
          select: {
            user_id: true,
            email: true,
          },
        },
      },
    });

    res.status(200).json({ data: workers });
  } catch (error) {
    console.error("GET WORKERS UNDER REVIEW ERROR:", error);
    res.status(500).json({ message: "Failed to fetch workers" });
  }
};


//----------------------------- Approve Worker Verification -----------------------------//
export const approveWorker = async (req, res) => {
  try {
    const workerId = Number(req.params.id);

    await prisma.$transaction([
      prisma.workerProfile.update({
        where: { user_id: workerId },
        data: { verification_status: "APPROVED" },
      }),
      prisma.notification.create({
        data: {
          user_id: workerId,
          type: "SUCCESS",
          message: "Votre profil a été validé par administrateur",
        },
      }),
    ]);

    res.status(200).json({ message: "Worker approved successfully" });
  } catch (error) {
    console.error("APPROVE WORKER ERROR:", error);
    res.status(500).json({ message: "Failed to approve worker" });
  }
};


//----------------------------- Reject Worker Verification -----------------------------//
export const rejectWorker = async (req, res) => {
  try {
    const workerId = Number(req.params.id);
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        message: "Rejection reason is required",
      });
    }

    await prisma.$transaction([
      prisma.workerProfile.update({
        where: { user_id: workerId },
        data: { verification_status: "REJECTED" },
      }),
      prisma.notification.create({
        data: {
          user_id: workerId,
          type: "WARNING",
          message: `Profil refusé : ${reason}`,
        },
      }),
    ]);

    res.status(200).json({ message: "Worker rejected successfully" });
  } catch (error) {
    console.error("REJECT WORKER ERROR:", error);
    res.status(500).json({ message: "Failed to reject worker" });
  }
};

//----------------------------- Mark Notification as Read -----------------------------//
export const markNotificationAsRead = async (req, res) => {
  try {
    const adminId = req.user.user_id;
    const notificationId = Number(req.params.id);

    const notification = await prisma.notification.findFirst({
      where: {
        notification_id: notificationId,
        user_id: adminId, // sécurité
      },
    });

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    await prisma.notification.update({
      where: { notification_id: notificationId },
      data: { is_read: true },
    });

    res.status(200).json({
      message: "Notification marked as read",
    });
  } catch (error) {
    console.error("MARK NOTIFICATION READ ERROR:", error);
    res.status(500).json({
      message: "Failed to mark notification as read",
    });
  }
};

//----------------------------- Mark All Notifications as Read -----------------------------//
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const adminId = req.user.user_id;

    await prisma.notification.updateMany({
      where: {
        user_id: adminId,
        is_read: false,
      },
      data: {
        is_read: true,
      },
    });

    res.status(200).json({
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("MARK ALL NOTIFICATIONS READ ERROR:", error);
    res.status(500).json({
      message: "Failed to mark all notifications as read",
    });
  }
};