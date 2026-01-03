import {prisma} from "../config/db.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";

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

    //  Transaction: User + WorkerProfile
      const user = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            email,
            password: hashedPassword,
            role: "WORKER",
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

    // Generate JWT + cookie
    const token = generateToken(user, res);

    res.status(201).json({
      status: "success",
      data: {
        user_id: user.user_id,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({
      message: "Registration failed",
      error : error.message,
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
          verification_status: "PENDING",
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
