import express from "express";
import Chat from "../models/chat.js";
import userMiddleware from "../Auth/middlewares/User.js";
import { generate } from "../chatbot.js"; // ✅ reuse your AI logic

const router = express.Router();

/**
 * POST /chat
 * Save and respond to a message
 */
router.post("/", userMiddleware, async (req, res) => {
	try {
		const { threadId, message, language } = req.body;
		const username = req.username;

		if (!threadId || !message) {
			return res.status(400).json({ msg: "threadId and message required" });
		}

		// Generate AI reply
		const reply = await generate(message, threadId, language);

		// Find or create chat document
		let chat = await Chat.findOne({ username, threadId });
		if (!chat) {
			chat = new Chat({ username, threadId, messages: [] });
		}

		// 🔹 Push user + assistant messages
		chat.messages.push({ role: "user", text: message });
		chat.messages.push({ role: "assistant", text: reply });
		await chat.save();

		return res.status(200).json({ message: reply });
	} catch (error) {
		console.error("Chat POST error:", error);
		return res.status(500).json({ msg: "Internal Server Error" });
	}
});

/**
 * GET /chat/history
 * Fetch all previous chat threads for the user
 */
router.get("/history", userMiddleware, async (req, res) => {
	try {
		const username = req.username;
		const chats = await Chat.find({ username }).sort({ updatedAt: -1 });
		res.json(chats);
	} catch (error) {
		console.error("Chat history error:", error);
		res.status(500).json({ msg: "Internal Server Error" });
	}
});

// Get messages of a specific thread
router.get("/:threadId", userMiddleware, async (req, res) => {
	try {
		const username = req.username;
		const { threadId } = req.params;

		const chat = await Chat.findOne({ username, threadId });
		// if (!chat) return res.status(404).json({ msg: "Chat not found" });
		if (!chat) return res.status(200).json({ messages: [] });

		res.json(chat.messages);
	} catch (error) {
		console.error("Chat thread fetch error:", error);
		res.status(500).json({ msg: "Internal Server Error" });
	}
});

export default router;
