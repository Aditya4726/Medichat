import React, { useState } from "react";

const InputBox = ({ onSend }) => {
	const [input, setInput] = useState("");

	const handleSend = () => {
		if (input.trim()) {
			onSend(input);
			setInput("");
		}
	};

	const handleKey = (e) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	return (
		<div className="fixed inset-x-0 bottom-0 flex items-center justify-center py-2 bg-neutral-900 z-[9999]">
			<div className="bg-neutral-800 p-2 rounded-3xl w-full max-w-3xl shadow-lg">
				<textarea
					value={input}
					onChange={(e) => setInput(e.target.value)}
					onKeyDown={handleKey}
					rows="2"
					className="w-full resize-none outline-0 p-3 bg-transparent text-white placeholder-gray-400"
					placeholder="Enter your message here..."
				/>
				<div className="flex items-center justify-end">
					<button
						onClick={handleSend}
						className="bg-white hover:bg-gray-300 px-4 py-1 text-black font-bold rounded-full cursor-pointer transition"
					>
						Ask
					</button>
				</div>
			</div>
		</div>
	);
};

export default InputBox;
