import { Router } from "express";
import { sendMessage, getChatHistory, markRead, getChatStatus, getUnreadCount, getSupportStudents, getSupportHistory, sendSupportMessage, markSupportRead, getSupportUnreadCount } from "../controllers/chat.controller.js";
import { authREquired } from "../middlewares/validateToken.js";

const router = Router();

router.post("/chat/send", authREquired, sendMessage);
router.get("/chat/history", authREquired, getChatHistory);
router.post("/chat/read", authREquired, markRead);
router.get("/chat/status", authREquired, getChatStatus);
router.get("/chat/unread/count", authREquired, getUnreadCount);

// Rutas específicas para soporte (admin)
router.get("/chat/support/students", authREquired, getSupportStudents);
router.get("/chat/support/history", authREquired, getSupportHistory);
router.post("/chat/support/send", authREquired, sendSupportMessage);
router.post("/chat/support/read", authREquired, markSupportRead);
router.get("/chat/support/unread", authREquired, getSupportUnreadCount);

export default router;
