import express from "express";
import { getOrCreateConversation, getMyConversations, getMessages, sendMessage } from "../controllers/chatController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/conversations", getOrCreateConversation);
router.get("/conversations", getMyConversations);
router.get("/conversations/:id/messages", getMessages);
router.post("/messages", sendMessage);

export default router;
