import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getChatHistory } from "../api/authAPI";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

const ChatSidebar = ({
	activeThread,
	setActiveThread,
	onNewChat,
	isMinimized,
	setIsMinimized,
}) => {
	const [history, setHistory] = useState([]);
	const [isMinimizedLocal, setIsMinimizedLocal] = useState(Boolean(isMinimized));
	const navigate = useNavigate();
	const { threadId } = useParams();

	useEffect(() => {
		const loadHistory = async () => {
			try {
				const data = await getChatHistory();
				setHistory(data);
			} catch (err) {
				console.error("Error loading history:", err.message);
			}
		};
		loadHistory();
	}, [activeThread]);

	useEffect(() => {
		setIsMinimizedLocal(Boolean(isMinimized));
	}, [isMinimized]);

	useEffect(() => {
		if (threadId && threadId !== activeThread) {
			setActiveThread(threadId);
		}
	}, [threadId]);

	const handleSelectThread = (id) => {
		setActiveThread(id);
		navigate(`/chat/${id}`);
	};

	const toggle = () => {
		const newState = !isMinimizedLocal;
		setIsMinimizedLocal(newState);
		if (typeof setIsMinimized === "function") setIsMinimized(newState);
	};

	return (
		<motion.aside
			initial={{ x: -200, opacity: 0 }}
			animate={{ x: 0, opacity: 1 }}
			transition={{ duration: 0.3 }}
			className={`fixed top-20 left-0 z-30 h-[calc(100vh-5rem)]
				border-r border-cyan-400/20 
				backdrop-blur-2xl
				bg-gradient-to-b from-[#081122]/95 via-[#0e1c3a]/95 to-[#13335f]/90
				shadow-[0_0_35px_rgba(34,211,238,0.2)]
				text-white transition-all duration-300
				${isMinimizedLocal ? "w-16" : "w-64"}
				rounded-tr-3xl rounded-br-3xl
			`}
		>
			{/* Header */}
			<div className="p-4 flex justify-between items-center border-b border-cyan-400/30 bg-[#0b1a30]/70 backdrop-blur-md">
				{!isMinimizedLocal && (
					<h2 className="text-cyan-300 font-semibold text-lg tracking-wide drop-shadow-[0_0_6px_rgba(56,189,248,0.6)]">
						Chat History
					</h2>
				)}

				<div className="flex items-center gap-2">
					{!isMinimizedLocal && (
						<button
							onClick={onNewChat}
							className="bg-gradient-to-r from-cyan-300 via-teal-400 to-blue-400 text-black font-bold text-sm px-3 py-1 rounded-full hover:opacity-90 shadow-[0_0_15px_rgba(56,189,248,0.5)]"
						>
							+
						</button>
					)}

					<button
						onClick={toggle}
						className="p-2 rounded-full bg-[#0a1628]/80 hover:bg-[#132a4d]/80 border border-cyan-400/40 transition"
						aria-label={isMinimizedLocal ? "Expand sidebar" : "Minimize sidebar"}
					>
						{isMinimizedLocal ? (
							<ChevronRight size={18} className="text-cyan-300" />
						) : (
							<ChevronLeft size={18} className="text-cyan-300" />
						)}
					</button>
				</div>
			</div>

			{/* History List */}
			<AnimatePresence>
				{!isMinimizedLocal && (
					<motion.div
						initial={{ opacity: 0, y: -6 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -6 }}
						className="mt-3 px-2 py-2"
					>
						<div className="overflow-y-auto scroll-smooth no-scrollbar max-h-[calc(100vh-9rem)]">
							{history.length === 0 ? (
								<p className="text-gray-400 text-sm px-4 italic">No chats yet</p>
							) : (
								history.map((chat) => (
									<motion.div
										key={chat.threadId}
										onClick={() => handleSelectThread(chat.threadId)}
										whileHover={{
											scale: 1.02,
											boxShadow: "0 0 25px rgba(56,189,248,0.25)",
										}}
										className={`cursor-pointer px-4 py-3 mb-2 rounded-xl border transition-all duration-300 backdrop-blur-md ${
											activeThread === chat.threadId
												? "bg-gradient-to-r from-cyan-400/25 to-blue-500/25 border-cyan-400/70 shadow-[0_0_15px_rgba(56,189,248,0.3)]"
												: "bg-[#0e1a33]/70 border-cyan-700/20 hover:border-cyan-400/40 hover:bg-[#14294a]/80"
										}`}
									>
										<p className="truncate text-sm text-gray-100">
											{chat.messages?.[0]?.text || "New conversation"}
										</p>
										<p className="text-xs text-gray-400 mt-1">
											{new Date(chat.updatedAt).toLocaleString()}
										</p>
									</motion.div>
								))
							)}

							<div className="h-32" />
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Subtle glow accents */}
			<div className="absolute top-10 left-0 w-[120px] h-[120px] bg-cyan-400/10 rounded-full blur-[90px]" />
			<div className="absolute bottom-10 right-0 w-[150px] h-[150px] bg-blue-400/10 rounded-full blur-[100px]" />
		</motion.aside>
	);
};

export default ChatSidebar;
