import {prisma} from "../config/db.js";
import { supabase } from "../config/supabase.js";
import { encryptBuffer } from "../utils/encryption.js";

//----------------------------- Upload Diploma -----------------------------//
export const uploadDiploma = async (req, res) => {
  try {
    const userId = req.user.user_id;

    if (!req.file) {
      return res.status(400).json({
        message: "PDF file is required",
      });
    }

    //  Chiffrement
    const { encryptedData, iv } = encryptBuffer(req.file.buffer);

    //  Upload Supabase (bucket privé)
    const filePath = `worker_${userId}/diploma_${Date.now()}.enc`;

    const { error } = await supabase.storage
      .from("diplomas")
      .upload(filePath, encryptedData, {
        contentType: "application/octet-stream",
        metadata: { iv },
      });

    if (error) throw error;

    //  Sauvegarde DB
    const diploma = await prisma.diploma.create({
      data: {
        user_id: userId,
        name: req.body.name,
        institution: req.body.institution,
        file_path: filePath,
        description: req.body.description,
        verification_status: "PENDING",
      },
    });

    res.status(201).json({
      message: "Diploma uploaded successfully",
      data: diploma,
    });
  } catch (error) {
    console.error("UPLOAD DIPLOMA ERROR:", error);
    res.status(500).json({
      message: "Failed to upload diploma",
    });
  }
};
