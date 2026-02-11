import React, { useEffect, useRef } from "react";
import { marked } from "marked";

const ChatContainer = ({ messages }) => {
	const bottomRef = useRef(null);

	useEffect(() => {
		if (bottomRef.current) {
			bottomRef.current.scrollIntoView({ behavior: "smooth" });
		}
	}, [messages]);

	if (!messages || messages.length === 0)
		return (
			<div className="text-center text-gray-300 mt-10 italic tracking-wide">
				Start a new conversation...
			</div>
		);

	return (
		<div
			className="
				relative 
				p-6 md:p-10 
				space-y-5 
				overflow-y-auto 
				h-[80vh] 
				scroll-smooth 
				pb-24 
				no-scrollbar 
				bg-gradient-to-b from-[#030712]/95 via-[#0a192f]/95 to-[#132d61]/90
				backdrop-blur-3xl
				rounded-3xl
				shadow-[0_0_45px_rgba(34,211,238,0.15)]
				border border-cyan-400/20
				mx-2 md:mx-6
				text-gray-100
			"
		>
			{/* 🌌 Background glow layers */}
			<div className="absolute inset-0 overflow-hidden pointer-events-none">
				<div className="absolute top-10 left-10 w-[280px] h-[280px] bg-cyan-400/15 rounded-full blur-[130px]" />
				<div className="absolute bottom-10 right-10 w-[320px] h-[320px] bg-blue-600/20 rounded-full blur-[150px]" />
				<div className="absolute top-1/3 right-1/3 w-[200px] h-[200px] bg-amber-300/10 rounded-full blur-[100px]" />
			</div>

			{/* 💬 Message bubbles */}
			{messages.map((msg, idx) => (
				<div
					key={idx}
					className={`flex relative z-10 ${
						msg.role === "user" ? "justify-end" : "justify-start"
					}`}
				>
					<div
						className={`max-w-[80%] px-5 py-3 rounded-2xl border text-sm md:text-base leading-relaxed shadow-[0_0_25px_rgba(56,189,248,0.15)] transition-all duration-300 backdrop-blur-xl ${
							msg.role === "user"
								? "bg-gradient-to-r from-cyan-300/90 via-blue-400/90 to-amber-200/90 text-black border-cyan-200/40 rounded-br-none hover:shadow-[0_0_30px_rgba(56,189,248,0.3)]"
								: "bg-gradient-to-br from-[#13294b]/90 via-[#1e3a8a]/90 to-[#243b55]/90 text-gray-100 border-cyan-700/20 rounded-bl-none hover:shadow-[0_0_25px_rgba(56,189,248,0.25)]"
						}`}
					>
						<div
							dangerouslySetInnerHTML={{
								__html: marked.parse(msg.text || msg.message || ""),
							}}
						/>
					</div>
				</div>
			))}

			{/* Scroll anchor */}
			<div ref={bottomRef} className="h-12" />
		</div>
	);
};

export default ChatContainer;
