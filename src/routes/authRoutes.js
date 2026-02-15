import express from "express";
import { registerWorker,registerEstablishment, login, logout,verifyEmailCode,resendVerificationCode,getMe,forgotPassword,resetPassword } from "../controllers/authController.js";
import { validate } from "../middleware/validateMiddleware.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { registerSchema, registerEstablishmentSchema, loginSchema } from "../validators/authSchema.js";

const router = express.Router();




router.post("/register/worker", validate(registerSchema), registerWorker);


router.post("/register/establishment", validate(registerEstablishmentSchema), registerEstablishment);

router.post("/resend-verification-code", resendVerificationCode);


//verify email code
router.post("/verify-email", verifyEmailCode);

// Forgot password
router.post("/forgot-password", forgotPassword);

// Reset password
router.post("/reset-password", resetPassword);

// Login / Logout
router.post("/login", validate(loginSchema), login);
router.post("/logout", logout);
router.get("/me",authMiddleware, getMe);




router.post("/register/worker", validate(registerSchema), registerWorker);
router.post("/register/establishment", validate(registerEstablishmentSchema), registerEstablishment);
router.post("/login", validate(loginSchema), login);



export default router;
