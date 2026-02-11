import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { loginUser, registerUser, findUser } from "../api/authAPI";
import Navbar from "../components/Navbar";

const AuthPage = () => {
	const [isLogin, setIsLogin] = useState(true);
	const [fullname, setFullname] = useState("");
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [language, setLanguage] = useState("");
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			let token;
			let userData;

			if (isLogin) {
				token = await loginUser(username, password);
				userData = await findUser(username);
			} else {
				token = await registerUser(fullname, username, password);
				userData = { fullname, username };
			}

			localStorage.setItem("authToken", token);
			localStorage.setItem("user", JSON.stringify(userData));

			navigate("/chat");
		} catch (err) {
			setError(err.message || "Something went wrong");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-b from-[#1E1B4B] via-[#2E1A47] to-[#3F1A54] flex flex-col items-center justify-center relative overflow-hidden text-white">
			{/* ✨ Purple glowing orbs */}
			<div className="absolute inset-0 overflow-hidden">
				<motion.div
					className="absolute top-[10%] left-[-10%] w-[350px] h-[350px] bg-[#a855f7]/30 rounded-full blur-[120px]"
					animate={{ x: [0, 20, 0], y: [0, 30, 0] }}
					transition={{ repeat: Infinity, duration: 12, ease: "easeInOut" }}
				/>
				<motion.div
					className="absolute bottom-[15%] right-[-10%] w-[400px] h-[400px] bg-[#9333ea]/25 rounded-full blur-[140px]"
					animate={{ x: [0, -20, 0], y: [0, -20, 0] }}
					transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
				/>
			</div>

			{/* ✨ Subtle dotted grid overlay */}
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:35px_35px]" />

			{/* 🧭 Navbar */}
			<Navbar language={language} setLanguage={setLanguage} />

			{/* 🔮 Auth Card */}
			<div className="mt-24 w-full flex items-center justify-center px-4 relative z-10">
				<motion.div
					initial={{ opacity: 0, y: 40 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					className="bg-[#2B1B45]/70 backdrop-blur-2xl rounded-3xl p-10 w-full max-w-md shadow-[0_0_40px_rgba(168,85,247,0.2)] border border-[#a855f7]/30"
				>
					<h1 className="text-4xl font-extrabold text-center bg-gradient-to-r from-pink-400 via-purple-400 to-violet-300 bg-clip-text text-transparent mb-8 tracking-wide">
						{isLogin ? "Welcome Back 💫" : "Join MediChat 🌟"}
					</h1>

					<form onSubmit={handleSubmit} className="space-y-5">
						<AnimatePresence mode="wait">
							{!isLogin && (
								<motion.input
									key="fullname"
									type="text"
									placeholder="Full Name"
									value={fullname}
									onChange={(e) => setFullname(e.target.value)}
									className="w-full px-4 py-3 rounded-xl bg-[#3A245B]/80 text-white border border-[#a855f7]/30 focus:outline-none focus:border-[#c084fc] placeholder-gray-400 shadow-inner transition duration-300"
									required
									initial={{ opacity: 0, y: -10 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -10 }}
								/>
							)}
						</AnimatePresence>

						<input
							type="text"
							placeholder="Username"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							className="w-full px-4 py-3 rounded-xl bg-[#3A245B]/80 text-white border border-[#a855f7]/30 focus:outline-none focus:border-[#c084fc] placeholder-gray-400 shadow-inner transition duration-300"
							required
						/>

						<input
							type="password"
							placeholder="Password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="w-full px-4 py-3 rounded-xl bg-[#3A245B]/80 text-white border border-[#a855f7]/30 focus:outline-none focus:border-[#c084fc] placeholder-gray-400 shadow-inner transition duration-300"
							required
						/>

						{error && (
							<p className="text-red-400 text-sm bg-red-900/40 p-2 rounded-lg text-center">
								⚠️ {error}
							</p>
						)}

						<motion.button
							whileHover={{
								scale: 1.03,
								boxShadow: "0 0 25px rgba(168,85,247,0.6)",
							}}
							whileTap={{ scale: 0.97 }}
							type="submit"
							disabled={loading}
							className="w-full py-3 rounded-xl bg-gradient-to-r from-[#9333ea] via-[#a855f7] to-[#d946ef] font-semibold text-white tracking-wide shadow-lg transition-all duration-300"
						>
							{loading ? "Please wait..." : isLogin ? "Login" : "Sign Up"}
						</motion.button>
					</form>

					<p className="text-gray-400 text-sm text-center mt-6">
						{isLogin ? "Don’t have an account?" : "Already have an account?"}{" "}
						<button
							onClick={() => setIsLogin(!isLogin)}
							className="text-violet-400 hover:text-pink-400 font-medium transition-colors"
						>
							{isLogin ? "Sign Up" : "Login"}
						</button>
					</p>
				</motion.div>
			</div>
		</div>
	);
};

export default AuthPage;
