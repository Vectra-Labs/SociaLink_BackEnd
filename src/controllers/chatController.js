import * as chatService from "../services/chatService.js";

//----------------------------- Get or Create Conversation -----------------------------//
export const getOrCreateConversation = async (req, res) => {
    try {
        const currentUserId = req.user.user_id;

        const conversation = await chatService.getOrCreateConversationService(currentUserId, req.body);

        res.status(200).json({ data: conversation });
    } catch (error) {
        console.error("GET/CREATE CONVERSATION ERROR:", error);
        res.status(error.message === "Access denied" ? 403 : 500).json({ message: error.message || "Failed to handle conversation" });
    }
};

//----------------------------- Get My Conversations -----------------------------//
export const getMyConversations = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const role = req.user.role;

        const result = await chatService.getMyConversationsService(userId, role);

        res.status(200).json({ data: result });
    } catch (error) {
        console.error("GET MY CONVERSATIONS ERROR:", error);
        res.status(500).json({ message: "Failed to fetch conversations" });
    }
};

//----------------------------- Get Conversation Messages -----------------------------//
export const getMessages = async (req, res) => {
    try {
        const conversationId = Number(req.params.id);
        const userId = req.user.user_id;

        const messages = await chatService.getMessagesService(conversationId, userId);

        res.status(200).json({ data: messages });
    } catch (error) {
        console.error("GET MESSAGES ERROR:", error);
        res.status(error.message === "Access denied" ? 403 : 500).json({ message: error.message || "Failed to fetch messages" });
    }
};

//----------------------------- Send Message -----------------------------//
export const sendMessage = async (req, res) => {
    try {
        const senderId = req.user.user_id;

        const message = await chatService.sendMessageService(senderId, req.body);

        res.status(201).json({ data: message });
    } catch (error) {
        console.error("SEND MESSAGE ERROR:", error);
        res.status(error.message === "Access denied" ? 403 : 500).json({ message: error.message || "Failed to send message" });
    }
};
