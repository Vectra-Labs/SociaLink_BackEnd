import { prisma } from "../config/db.js";
import { supabase } from "../config/supabase.js";
import { encryptBuffer, decryptBuffer } from "../utils/encryption.js";

//----------------------------- Upload Diploma -----------------------------//
export const uploadDiplomaService = async (userId, bodyData, file) => {
    if (!file) {
        throw new Error("PDF file is required");
    }

    //  Chiffrement (IV prepended)
    const { encryptedData } = encryptBuffer(file.buffer);

    //  Upload Supabase (bucket privé)
    const filePath = `worker_${userId}/diploma_${Date.now()}.enc`;

    const { error } = await supabase.storage
        .from("diplomas")
        .upload(filePath, encryptedData, {
            contentType: "application/octet-stream",
            // No metadata needed anymore since IV is in file
        });

    if (error) throw new Error(error.message);

    //  Sauvegarde DB
    const diploma = await prisma.diploma.create({
        data: {
            user_id: userId,
            name: bodyData.name,
            institution: bodyData.institution,
            file_url: filePath, // Storing the storage path in file_url
            description: bodyData.description,
            verification_status: "PENDING",
        },
    });

    // The API consumers (Admin/Worker) will need to construct the URL or we construct it in GET requests
    // For the response here, we can return the constructed URL
    const baseUrl = process.env.API_URL || "http://localhost:3000";
    const downloadUrl = `${baseUrl}/api/diplomas/${diploma.diploma_id}/download`;

    // We return the object with the download URL masked over the internal path for the frontend
    const responseData = {
        ...diploma,
        file_url: downloadUrl
    };

    return responseData;
};

//----------------------------- Delete Diploma -----------------------------//
export const deleteDiplomaService = async (userId, diplomaId) => {
    // Check if diploma exists and belongs to user
    const diploma = await prisma.diploma.findFirst({
        where: {
            diploma_id: diplomaId,
            user_id: userId,
        },
    });

    if (!diploma) {
        throw new Error("Diploma not found or not authorized");
    }

    if (diploma.verification_status === "VERIFIED") {
        throw new Error("Cannot delete a verified diploma");
    }

    // Delete from Supabase
    // We used to look for file_path, now we use file_url which holds the path
    if (diploma.file_url) {
        const { error } = await supabase.storage
            .from("diplomas")
            .remove([diploma.file_url]);

        if (error) {
            console.warn("Supabase file deletion error:", error);
        }
    }

    // Delete from DB
    await prisma.diploma.delete({
        where: { diploma_id: diplomaId },
    });

    return { message: "Diploma deleted successfully" };
};


//----------------------------- Download Diploma -----------------------------//
export const downloadDiplomaService = async (diplomaId, requestorId, requestorRole) => {
    const diploma = await prisma.diploma.findUnique({
        where: { diploma_id: diplomaId },
        include: {
            worker: {
                select: { user_id: true }
            }
        },
    });

    if (!diploma) {
        throw new Error("Diploma not found");
    }

    // Security Check
    if (requestorRole !== "ADMIN" && requestorRole !== "ESTABLISHMENT" && requestorId !== diploma.worker.user_id) {
        throw new Error("Access denied");
    }

    if (!diploma.file_url) {
        throw new Error("File path missing");
    }

    // Download from Supabase
    const { data: fileBlob, error } = await supabase.storage
        .from("diplomas")
        .download(diploma.file_url);

    if (error) throw new Error(error.message);

    // Convert Blob/File to Buffer
    const arrayBuffer = await fileBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Decrypt (IV is at the beginning)
    const decryptedPdf = decryptBuffer(buffer);

    return {
        buffer: decryptedPdf,
        filename: `diploma_${diplomaId}.pdf`
    };
};
