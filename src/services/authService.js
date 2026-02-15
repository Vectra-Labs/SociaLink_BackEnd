import { prisma } from "../config/db.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";
import { sendVerificationEmail, sendResetPasswordLink } from "../utils/sendEmail.js";
import crypto from "crypto";
import { supabase } from "../config/supabase.js"; // In case it's needed later, though not used in auth currently

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export const resetPasswordService = async (token, password) => {
    const user = await prisma.user.findFirst({
        where: {
            reset_password_token: token,
            reset_password_expires: {
                gt: new Date(),
            },
        },
    });

    if (!user) {
        throw new Error("Invalid or expired token");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
        where: { user_id: user.user_id },
        data: {
            password: hashedPassword,
            reset_password_token: null,
            reset_password_expires: null,
        },
    });

    return { message: "Password updated successfully" };
};

export const forgotPasswordService = async (email) => {
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        throw new Error("User not found");
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.update({
        where: { user_id: user.user_id },
        data: {
            reset_password_token: token,
            reset_password_expires: expires,
        },
    });

    const resetUrl = `http://localhost:5173/reset-password?token=${token}`;
    await sendResetPasswordLink(email, resetUrl);

    return { message: "Reset password link sent to email" };
};

export const getMeService = async (user) => {
    let additionalInfo = {};

    // If Worker, get verification status + profile pic
    if (user.role === "WORKER") {
        const worker = await prisma.workerProfile.findUnique({
            where: { user_id: user.user_id },
            select: {
                verification_status: true,
                profile_pic_url: true,
                first_name: true,
                last_name: true
            }
        });

        if (worker) {
            additionalInfo = {
                workerStatus: worker.verification_status,
                profile_pic_url: worker.profile_pic_url,
                first_name: worker.first_name,
                last_name: worker.last_name
            };
        }
    }
    // If Establishment, get logo
    else if (user.role === "ESTABLISHMENT") {
        const establishment = await prisma.establishmentProfile.findUnique({
            where: { user_id: user.user_id },
            select: {
                logo_url: true,
                name: true
            }
        });

        if (establishment) {
            additionalInfo = {
                profile_pic_url: establishment.logo_url, // Map logo to generic profile_pic_url
                first_name: establishment.name // Map name to first_name for generic display
            };
        }
    }

    return {
        user: {
            ...user,
            ...additionalInfo
        }
    };
};

export const registerWorkerService = async ({ email, password, first_name, last_name, phone, city_id }) => {
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        throw new Error("User already exists"); // Service throws plain error message
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const emailCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Transaction: User + WorkerProfile
    const user = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
            data: {
                email,
                password: hashedPassword,
                role: "WORKER",
                email_verified: false,
                email_code: emailCode,
                email_code_expires: expiresAt,
            },
        });

        await tx.workerProfile.create({
            data: {
                user_id: newUser.user_id,
                first_name,
                last_name,
                phone,
                city_id,
                verification_status: "PENDING",
            },
        });

        // NOTIFY ADMINS
        const admins = await tx.user.findMany({
            where: { role: "ADMIN" },
            select: { user_id: true }
        });

        if (admins.length > 0) {
            await tx.notification.createMany({
                data: admins.map(admin => ({
                    user_id: admin.user_id,
                    type: "INFO",
                    message: `Nouveau talent inscrit : ${first_name} ${last_name}. En attente de validation.`
                }))
            });
        }

        return newUser;
    });

    await sendVerificationEmail(user.email, emailCode);

    return user;
};

export const registerEstablishmentService = async ({ email, password, name, contact_first_name, contact_last_name, contact_function, phone, ice_number, city_id }) => {
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        throw new Error("Un compte avec cet email existe déjà");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
            data: {
                email,
                password: hashedPassword,
                role: "ESTABLISHMENT",
            },
        });

        await tx.establishmentProfile.create({
            data: {
                user_id: newUser.user_id,
                name,
                contact_first_name,
                contact_last_name,
                contact_function,
                phone,
                ice_number,
                city_id,
                verification_status: "VERIFIED",
            },
        });

        return newUser;
    });

    return user;
};

export const loginService = async ({ email, password }) => {
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        throw new Error("Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        throw new Error("Invalid email or password");
    }

    if (!user.email_verified) {
        throw new Error("Veuillez vérifier votre email avant de vous connecter"); // Special case handled by controller? Or just error message. Controller can check error message if needed, or we use a custom error type. For now string matching or just 401/403 in controller.
    }

    return user;
};

export const verifyEmailCodeService = async (email, code) => {
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        throw new Error("User not found");
    }

    if (user.email_verified) {
        throw new Error("Email already verified");
    }

    if (user.email_code !== code || user.email_code_expires < new Date()) {
        throw new Error("Invalid or expired code");
    }

    await prisma.user.update({
        where: { user_id: user.user_id },
        data: {
            email_verified: true,
            email_code: null,
            email_code_expires: null,
        },
    });

    return { message: "Email verified successfully" };
};

export const resendVerificationCodeService = async (email) => {
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        throw new Error("User not found");
    }

    if (user.email_verified) {
        throw new Error("Email already verified");
    }

    const newCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.user.update({
        where: { user_id: user.user_id },
        data: {
            email_code: newCode,
            email_code_expires: expiresAt,
        },
    });

    await sendVerificationEmail(email, newCode);

    return { message: "Verification code resent successfully" };
};
