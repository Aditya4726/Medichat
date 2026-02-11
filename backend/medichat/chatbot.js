// import readline from "node:readline/promises";
import "dotenv/config";
import Groq from "groq-sdk";
import { tavily } from "@tavily/core";
import NodeCache from "node-cache";
import Chat from "./models/chat.js"; // MongoDB model import

console.log("welcome to Medichat !!!");
console.log("API Key: " + process.env.GROQ_API_KEY);

const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// adding state/memory to the chatbot
const cache = new NodeCache({ stdTTL: 60 * 60 * 24 }); // 24 hours

// ----------------- Helper: truncate content -----------------
function truncate(content, maxLength = 1500) {
	if (!content) return "";
	return content.length > maxLength
		? content.slice(0, maxLength) + "..."
		: content;
}

// ----------------- Tool Function -----------------
async function webSearch({ query }) {
	console.log("Calling web search.....");
	try {
		const response = await tvly.search(query);
		if (!response || !response.results) {
			console.error("Tavily API returned unexpected response:", response);
			return "No results found or API error.";
		}

		// Summarize & truncate results
		const summarized = response.results
			.map((r) => r.content)
			.slice(0, 5)
			.join("\n\n");
		return truncate(summarized, 1500);
	} catch (error) {
		console.error("Error in webSearch:", error);
		return "Error occurred during web search.";
	}
}

export async function generate(userMessage, threadId, language) {
	// ------------------------- Custom “Who are you” Logic -------------------
	const lowerMsg = userMessage.toLowerCase();

	if (
		lowerMsg.includes("who are you") ||
		lowerMsg.includes("what is your name") ||
		lowerMsg.includes("your name") ||
		lowerMsg.includes("who made you") ||
		lowerMsg.includes("who created you") ||
		lowerMsg.includes("tell me about yourself")
	) {
		return `👋 Hello! I am **Medichat**, your AI-powered medical assistant created by **Aditya Samanta**.  
I can help answer your questions about health, diseases, medicines, and treatments in a professional and easy-to-understand way.`;
	}

	// -------------------------prompt message/input-------------------
	const baseMessages = [
		{
			role: "system",
			content: `You are Medichat, a smart personal medical assistant created by Aditya Samanta designed to assist with medical and health-related queries.

If you know the answer to a medical question, respond directly and clearly in ${language}.
If the answer requires real-time, local, or up-to-date information, or if you're unsure, use the available tool to gather the latest data.
Do not mention the tool unless necessary.

For non-medical questions:
If a question is unrelated to medical or health topics, kindly inform the user that you are only able to assist with medical-related inquiries and politely encourage them to ask about medical topics.

Examples:
**Q**: What is the treatment for high blood pressure?
**A**: The treatment for high blood pressure typically involves lifestyle changes such as reducing salt intake, regular exercise, and medications like ACE inhibitors, diuretics, or calcium channel blockers. Please consult with a healthcare provider for personalized treatment.

**Q**: What are the symptoms of COVID-19?
**A**: Common symptoms of COVID-19 include fever, cough, fatigue, and difficulty breathing. Other symptoms can include sore throat, loss of taste or smell, and muscle aches.

**Q**: What are the side effects of paracetamol?
**A**: Paracetamol is generally well-tolerated, but in some cases, it can cause side effects like liver damage, allergic reactions, or skin rashes, especially when taken in high doses or for extended periods.

**Q**: What is the latest medical news on diabetes treatment?
**A**: (use the search tool to get the latest medical news on diabetes treatment)

**Q**: What is the capital of France?
**A**: I am only able to assist with medical-related questions. Please feel free to ask me about health, treatment, or medical conditions.

location: India.
current date and time: ${new Date().toUTCString()}
Always provide responses in ${language}.
Always be polite and professional.`,
		},
	];

	// Retrieve messages from cache or MongoDB
	let messages = cache.get(threadId);
	if (!messages) {
		try {
			const chatFromDB = await Chat.findOne({ threadId });
			if (chatFromDB && chatFromDB.messages.length > 0) {
				console.log(
					`🧠 Restoring chat memory from MongoDB for thread ${threadId}`
				);
				messages = [
					baseMessages[0],
					...chatFromDB.messages.map((msg) => ({
						role: msg.role,
						content: msg.text,
					})),
				];
			} else {
				messages = baseMessages;
			}
		} catch (err) {
			console.error("⚠️ MongoDB memory load error:", err.message);
			messages = baseMessages;
		}
		cache.set(threadId, messages);
	}

	messages.push({
		role: "user",
		content: userMessage + ` Output language (strict): ${language}`,
	});

	const MAX_RETRIES = 10;
	let attempts = 0;

	// ---------------- Keep conversation history short ----------------
	if (messages.length > 20) {
		// keep system + last 19 messages
		messages.splice(1, messages.length - 20);
	}

	// let model = "llama-3.3-70b-versatile"; // default heavy model
	let model = "openai/gpt-oss-20b"; // default heavy model

	while (attempts < MAX_RETRIES) {
		try {
			attempts++;
			//--------------------------llm invoke--------------------------
			const completion = await groq.chat.completions.create({
				temperature: 0,
				model: model,
				messages: messages,
				tools: [
					{
						type: "function",
						function: {
							name: "webSearch",
							description:
								"Search the latest information and realtime data on the internet.",
							parameters: {
								type: "object",
								properties: {
									query: {
										type: "string",
										description: "The search query to perform search on.",
									},
								},
								required: ["query"],
							},
						},
					},
				],
				tool_choice: "auto",
			});

			messages.push(completion.choices[0].message);

			const toolCalls = completion.choices[0].message.tool_calls;

			if (!toolCalls) {
				// store messages in cache
				cache.set(threadId, messages);
				return completion.choices[0].message.content;
			}

			// if tool present
			for (const tool of toolCalls) {
				const functionName = tool.function.name;
				const functionParams = tool.function.arguments;

				if (functionName === "webSearch") {
					const toolResult = await webSearch(JSON.parse(functionParams));

					messages.push({
						tool_call_id: tool.id,
						role: "tool",
						name: functionName,
						content: toolResult,
					});
				}
			}
		} catch (err) {
			if (err.status === 413) {
				messages.splice(1, messages.length - 10);
				continue; // retry
			}
			console.error("LLM error:", err);
			return `Error in LLM call: ${err.message || err}`;
		}
	}
	return "⚠️ I couldn't get a response after multiple retries. Please try again later.";
}

console.log("hello world");
