import { prisma } from "../config/db.js";

//----------------------------- Get or Create Conversation -----------------------------//
export const getOrCreateConversationService = async (currentUserId, { worker_id, establishment_id }) => {
    // Security: Only the worker or the establishment involved can create/get it
    if (currentUserId !== worker_id && currentUserId !== establishment_id) {
        throw new Error("Access denied");
    }

    let conversation = await prisma.conversation.findUnique({
        where: {
            worker_id_establishment_id: {
                worker_id: Number(worker_id),
                establishment_id: Number(establishment_id)
            }
        }
    });

    if (!conversation) {
        conversation = await prisma.conversation.create({
            data: {
                worker_id: Number(worker_id),
                establishment_id: Number(establishment_id)
            }
        });
    }

    return conversation;
};

//----------------------------- Get My Conversations -----------------------------//
export const getMyConversationsService = async (userId, role) => {
    const conversations = await prisma.conversation.findMany({
        where: {
            OR: [
                { worker_id: userId },
                { establishment_id: userId }
            ]
        },
        include: {
            messages: {
                orderBy: { created_at: 'desc' },
                take: 1
            },
            // We include both profiles to show the name of the "other" person
            worker: {
                select: {
                    first_name: true,
                    last_name: true,
                    profile_pic_url: true
                }
            },
            establishment: {
                select: {
                    name: true,
                    logo_url: true
                }
            }
        },
        orderBy: { updated_at: 'desc' }
    });

    // Format for frontend
    const result = conversations.map(c => {
        const otherUser = role === 'WORKER' ? {
            name: c.establishment.name,
            avatar: c.establishment.logo_url
        } : {
            name: `${c.worker.first_name} ${c.worker.last_name}`,
            avatar: c.worker.profile_pic_url
        };

        return {
            conversation_id: c.conversation_id,
            otherUser,
            lastMessage: c.messages[0] || null,
            updated_at: c.updated_at
        };
    });

    return result;
};

//----------------------------- Get Conversation Messages -----------------------------//
export const getMessagesService = async (conversationId, userId) => {
    // Check if user belongs to conversation
    const conversation = await prisma.conversation.findUnique({
        where: { conversation_id: conversationId }
    });

    if (!conversation || (conversation.worker_id !== userId && conversation.establishment_id !== userId)) {
        throw new Error("Access denied");
    }

    const messages = await prisma.message.findMany({
        where: { conversation_id: conversationId },
        orderBy: { created_at: 'asc' }
    });

    return messages;
};

//----------------------------- Send Message -----------------------------//
export const sendMessageService = async (senderId, { conversation_id, content }) => {
    // Check conversation exists and user is part of it
    const conversation = await prisma.conversation.findUnique({
        where: { conversation_id: Number(conversation_id) }
    });

    if (!conversation || (conversation.worker_id !== senderId && conversation.establishment_id !== senderId)) {
        throw new Error("Access denied");
    }

    const message = await prisma.message.create({
        data: {
            conversation_id: Number(conversation_id),
            sender_id: senderId,
            content
        }
    });

    // Update conversation timestamp for sorting
    await prisma.conversation.update({
        where: { conversation_id: Number(conversation_id) },
        data: { updated_at: new Date() }
    });

    return message;
};
