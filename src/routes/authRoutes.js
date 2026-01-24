import express from "express";
import { registerWorker,registerEstablishment, login, logout,verifyEmailCode,resendVerificationCode,getMe } from "../controllers/authController.js";
import { validate } from "../middleware/validateMiddleware.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { registerSchema, registerEstablishmentSchema, loginSchema } from "../validators/authSchema.js";

const router = express.Router();




router.post("/register/worker", validate(registerSchema), registerWorker);


router.post("/register/establishment", validate(registerEstablishmentSchema), registerEstablishment);

router.post("/resend-verification-code", resendVerificationCode);


//verify email code
router.post("/verify-email", verifyEmailCode);


router.post("/login", validate(loginSchema), login);
router.get("/me",authMiddleware, getMe);




router.post("/register/worker", validate(registerSchema), registerWorker);
router.post("/register/establishment", validate(registerEstablishmentSchema), registerEstablishment);
router.post("/login", validate(loginSchema), login);

router.post("/logout", logout);

export default router;
