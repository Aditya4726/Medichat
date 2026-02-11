import readline from "node:readline/promises";
import "dotenv/config";
import Groq from "groq-sdk";
import { tavily } from "@tavily/core";

console.log("welcome to GenAI !!!");
console.log("API Key: " + process.env.GROQ_API_KEY);

const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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

async function main() {
	// for input and output from command prompt
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	// -------------------------prompt message/input-------------------
	const messages = [
		{
			role: "system",
			content: `
                You are "neo", A smart personal assistant of Rahul Chowdhury. Give concise answers.
                You have access to following tools:
                1. webSearch({query}: {query: string}) // Search the latest information and realtime data on the internet.
                Current Location: "India".
                current date and time: ${new Date().toUTCString()}
                do not expose your technology information like llm etc.`,
		},
		// { role: "user", content: `Hello` },
	];

	while (true) {
		const question = await rl.question(`${"-".repeat(55)}\n\nyou: `);
		if (question.toLowerCase() === "bye") break;

		messages.push({ role: "user", content: question });

		// ---------------- Keep conversation history short ----------------
		if (messages.length > 20) {
			// keep system + last 19 messages
			messages.splice(1, messages.length - 20);
		}

		while (true) {
			try {
				//--------------------------llm invoke--------------------------
				const completion = await groq.chat.completions.create({
					temperature: 0,
					model: "openai/gpt-oss-20b",
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
					console.log(`\nAssistant: ${completion.choices[0].message.content}`);
					break;
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
				// ---------------- Handle token overflow (413) ----------------
				if (err.status === 413) {
					console.log("⚠️ Request too large, trimming context and retrying...");
					messages.splice(1, messages.length - 10); // keep system + last 9 messages
					continue; // retry
				}
				console.error("Error in LLM call:", err);
				break;
			}
		}
	}

	rl.close();
}

// -----------------------main calling-------------------------
main();
