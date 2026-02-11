import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
	role: { type: String, required: true },
	text: { type: String, required: true },
});

const ChatSchema = new mongoose.Schema(
	{
		username: { type: String, required: true },
		threadId: { type: String, required: true },
		messages: [MessageSchema],
	},
	{ timestamps: true }
);

export default mongoose.model("Chat", ChatSchema);
