import {prisma} from "../config/db.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";
import { sendVerificationEmail } from "../utils/sendEmail.js";



 const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};


//----------------------------- Get Current User -----------------------------//
export const getMe = async (req, res) => {
  try {
    res.status(200).json({
      status: "success",
      user: req.user,
    });
  } catch (error) {
    console.error("GET ME ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch user",
    });
  }
};

//----------------------------- worker Registration -----------------------------//
export const registerWorker = async (req, res) => {
  try {
    // req.body is already validated by Zod
    const { email, password , first_name ,last_name, phone } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

   

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
     const emailCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    //  Transaction: User + WorkerProfile
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
            verification_status: "PENDING",
          },
        });

        return newUser;
      });

  // Send verification email
    await sendVerificationEmail(user.email, emailCode);
  res.status(201).json({
      message: "Registration successful. Verification code sent to email.",
      data: {
        email: user.email,
      },
    });
 } catch (error) {
    console.error("REGISTER WORKER ERROR:", error);
    res.status(500).json({
      message: "Registration failed",
    });
  }
};

//----------------------------- Establishment Registration -----------------------------//
export const registerEstablishment = async (req, res) => {
  try {
    const {
      email,
      password,
      name,
      contact_first_name,
      contact_last_name,
      phone,
      ice_number,
    } = req.body;

    //  Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Un compte avec cet email existe déjà",
      });
    }

    //  Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    //  Transaction: User + EstablishmentProfile
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
          phone,
          ice_number,
          verification_status: "APPROVED",
        },
      });

      return newUser;
    });

    //  Generate JWT + cookie
    const token = generateToken(user, res);

    res.status(201).json({
      message: "Inscription établissement réussie",
      user: {
        user_id: user.user_id,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("REGISTER ESTABLISHMENT ERROR:", error);
    res.status(500).json({
      message: "Erreur lors de l'inscription de l'établissement",
    });
  }
};

//----------------------------- Login -----------------------------//
export const login = async (req, res) => {
  try {
    // req.body is already validated by Zod
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

       // BLOCK LOGIN IF EMAIL NOT VERIFIED
    if (!user.email_verified) {
      return res.status(403).json({
        message: "Veuillez vérifier votre email avant de vous connecter",
      });
    }

    // Generate JWT + cookie
    const token = generateToken(user, res);

    res.status(200).json({
      status: "success",
      data: {
        user_id: user.user_id,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({
      message: "Login failed",
    });
  }
};

//-----------------------------  Logout -----------------------------//
export const logout = async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
};

//-----------------------------  Verify Email Code -----------------------------//
export const verifyEmailCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.email_verified) {
      return res.status(400).json({
        message: "Email already verified",
      });
    }

    if (
      user.email_code !== code ||
      user.email_code_expires < new Date()
    ) {
      return res.status(400).json({
        message: "Invalid or expired code",
      });
    }

    await prisma.user.update({
      where: { user_id: user.user_id },
      data: {
        email_verified: true,
        email_code: null,
        email_code_expires: null,
      },
    });

    res.status(200).json({
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("VERIFY EMAIL ERROR:", error);
    res.status(500).json({
      message: "Verification failed",
    });
  }
};


// -----------------------------  Resend Verification Code -----------------------------//
export const resendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.email_verified) {
      return res.status(400).json({
        message: "Email already verified",
      });
    }

    // Generate new OTP
    const newCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update DB
    await prisma.user.update({
      where: { user_id: user.user_id },
      data: {
        email_code: newCode,
        email_code_expires: expiresAt,
      },
    });

    // Send email
    await sendVerificationEmail(email, newCode);

    res.status(200).json({
      message: "Verification code resent successfully",
    });
  } catch (error) {
    console.error("RESEND CODE ERROR:", error);
    res.status(500).json({
      message: "Failed to resend verification code",
    });
  }
};
