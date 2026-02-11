import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { generate } from "./chatbot.js";
import bodyParser from "body-parser";

import userRoutes from "./Auth/routes/UserRoutes.js";
import ChatRoutes from "./routes/ChatRoutes.js";

dotenv.config();

const app = express();
const port = 5000;

app.use(express.json());
app.use(cors());
// app.use(
// 	cors({
// 		origin: [
// 			"http://localhost:5173", 
// 			"https://neogpt-blue.vercel.app",
// 			"https://neogpt-blue.netlify.app",
// 		],
// 		methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
// 		allowedHeaders: ["Content-Type", "Authorization"],
// 		credentials: true,
// 	})
// );
app.use(bodyParser.json());

app.get("/", (req, res) => {
	res.send("Welcome to UniGPT!");
});

app.use("/user", userRoutes);
app.use("/chat", ChatRoutes);


// app.post("/chat", async (req, res) => {
// 	const { message, threadId, language } = req.body;
// 	console.log(language);

// 	if (!message || !threadId) {
// 		res.status(400).json({ message: "All field are required" });
// 		return;
// 	}

// 	console.log("message:", message);
// 	const result = await generate(message, threadId, language);

// 	res.json({ message: result });
// });

app.post("/chat", async (req, res) => {
	const { message, threadId, language } = req.body;
	console.log(language);

	if (!message || !threadId) {
		res.status(400).json({ message: "All field are required" });
		return;
	}

	console.log("message:", message);
	const result = await generate(message, threadId, language);

	res.json({ message: result });
});


// MongoDB Connection
mongoose
	.connect(process.env.MONGO_URI || "mongodb://localhost:27017/securelink")
	.then(() => console.log("MongoDB connected"))
	.catch((err) => console.error("MongoDB connection error:", err));

app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});





