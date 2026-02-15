import * as authService from "../services/authService.js";
import { generateToken } from "../utils/generateToken.js";

// ----------------------------- Reset Password -----------------------------//
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    const result = await authService.resetPasswordService(token, password);
    res.json(result);
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
    res.status(400).json({ message: error.message || "Reset failed" });
  }
};

//  ----------------------------- Forgot Password -----------------------------//
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const result = await authService.forgotPasswordService(email);
    res.json(result);
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);
    res.status(500).json({ message: error.message || "Failed to send reset link" });
  }
};

//----------------------------- Get Current User -----------------------------//
export const getMe = async (req, res) => {
  try {
    const data = await authService.getMeService(req.user);
    res.status(200).json({
      status: "success",
      user: data.user
    });
  } catch (error) {
    console.error("GET ME ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch user",
    });
  }
};

//----------------------------- Worker Registration -----------------------------//
export const registerWorker = async (req, res) => {
  try {
    const user = await authService.registerWorkerService(req.body);
    res.status(201).json({
      message: "Registration successful. Verification code sent to email.",
      data: {
        email: user.email,
      },
    });
  } catch (error) {
    console.error("REGISTER WORKER ERROR:", error);
    // Determine status code based on error message or type if possible, otherwise 500 or 400
    const status = error.message === "User already exists" ? 400 : 500;
    res.status(status).json({
      message: error.message || "Registration failed",
    });
  }
};

//----------------------------- Establishment Registration -----------------------------//
export const registerEstablishment = async (req, res) => {
  try {
    const user = await authService.registerEstablishmentService(req.body);
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
    const status = error.message === "Un compte avec cet email existe déjà" ? 400 : 500;
    res.status(status).json({
      message: error.message || "Erreur lors de l'inscription de l'établissement",
    });
  }
};

//----------------------------- Login -----------------------------//
export const login = async (req, res) => {
  try {
    const user = await authService.loginService(req.body);
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
    let status = 401;
    if (error.message.includes("vérifier votre email")) status = 403;
    res.status(status).json({
      message: error.message || "Login failed",
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
    const result = await authService.verifyEmailCodeService(email, code);
    res.status(200).json(result);
  } catch (error) {
    console.error("VERIFY EMAIL ERROR:", error);
    const status = (error.message === "User not found") ? 404 : 400;
    res.status(status).json({
      message: error.message || "Verification failed",
    });
  }
};

// -----------------------------  Resend Verification Code -----------------------------//
export const resendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;
    const result = await authService.resendVerificationCodeService(email);
    res.status(200).json(result);
  } catch (error) {
    console.error("RESEND CODE ERROR:", error);
    const status = (error.message === "User not found") ? 404 : 400;
    res.status(status).json({
      message: error.message || "Failed to resend verification code",
    });
  }
};
