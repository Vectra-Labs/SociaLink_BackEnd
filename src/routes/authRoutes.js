import express from "express";
import { registerWorker,registerEstablishment, login, logout } from "../controllers/authController.js";
import { validate } from "../middleware/validateMiddleware.js";
import { registerSchema, registerEstablishmentSchema, loginSchema } from "../validators/authSchema.js";

const router = express.Router();



/**
 * @swagger
 * /api/auth/register/worker:
 *   post:
 *     summary: Register a new worker
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: worker@test.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       201:
 *         description: Worker registered successfully
 *       400:
 *         description: Validation error or user already exists
 */
router.post("/register/worker", validate(registerSchema), registerWorker);

/**
 * @swagger
 * /api/auth/register/establishment:
 *   post:
 *     summary: Register a new establishment
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 example: establishment@test.com
 *               password:
 *                 type: string
 *                 example: password123
 *               name:
 *                 type: string
 *                 example: Clinique Al Amal
 *     responses:
 *       201:
 *         description: Establishment registered successfully
 *       400:
 *         description: Validation error or user already exists
 */
router.post("/register/establishment", validate(registerEstablishmentSchema), registerEstablishment);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: worker@test.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid email or password
 */
router.post("/login", validate(loginSchema), login);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout current user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: User logged out successfully
 */

router.post("/register/worker", validate(registerSchema), registerWorker);
router.post("/register/establishment", validate(registerEstablishmentSchema), registerEstablishment);
router.post("/login", validate(loginSchema), login);

router.post("/logout", logout);

export default router;
