import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LanguageSelect from "./LanguageSelect";
import { getUser, updateUserLanguage } from "../api/authAPI";
import { useNavigate } from "react-router-dom";
import logo from "../assets/OIP.webp";

const Navbar = ({ language, setLanguage }) => {
	const [user, setUser] = useState(null);
	const [showProfile, setShowProfile] = useState(false);
	const dropdownRef = useRef(null);
	const navigate = useNavigate();

	useEffect(() => {
		const loadUser = async () => {
			try {
				const data = await getUser();
				setUser(data);
				setLanguage(data.language || "English");
			} catch (err) {
				console.error("Navbar getUser error:", err.message);
			}
		};
		loadUser();
	}, [setLanguage]);

	const handleLanguageChange = async (newLang) => {
		try {
			setLanguage(newLang);
			const res = await updateUserLanguage(newLang);
			setUser((prev) => (prev ? { ...prev, language: res.language } : prev));
			localStorage.setItem(
				"user",
				JSON.stringify({ ...(user || {}), language: res.language })
			);
		} catch (err) {
			console.error("handleLanguageChange error:", err.message);
		}
	};

	useEffect(() => {
		const handleClickOutside = (e) => {
			if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
				setShowProfile(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleLogout = () => {
		localStorage.removeItem("authToken");
		localStorage.removeItem("user");
		navigate("/home");
	};

	return (
		<nav className="w-full fixed top-0 z-50 flex justify-between items-center px-6 py-3 
			bg-gradient-to-r from-[#6C63FF]/90 via-[#8B5CF6]/90 to-[#EC4899]/90
			backdrop-blur-xl border-b border-white/20 shadow-[0_0_25px_rgba(255,255,255,0.15)]">
			
			{/* 🔹 Logo Section */}
			<div
				className="flex items-center gap-3 cursor-pointer group"
				onClick={() => navigate("/home")}
			>
				<motion.img
					src={logo}
					alt="logo"
					className="w-10 h-10 drop-shadow-[0_0_10px_rgba(255,255,255,0.6)] group-hover:scale-110 transition-transform"
					whileHover={{ rotate: 6 }}
				/>
				<div className="relative">
					<span className="text-2xl font-extrabold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
						MediChat
					</span>
					<div className="absolute -bottom-1 left-0 w-full h-[2px] bg-white/50 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
				</div>
				<span className="text-white/70 italic text-sm hidden sm:inline ml-2">
					Empowering Better Health Through AI
				</span>
			</div>

			{/* 🔹 Right Section */}
			<div className="flex items-center gap-4 relative">
				<LanguageSelect
					language={language}
					setLanguage={handleLanguageChange}
					small
				/>

				{user ? (
					<>
						<div
							onClick={() => setShowProfile((prev) => !prev)}
							className="cursor-pointer rounded-full bg-white/80 text-black font-bold w-10 h-10 flex items-center justify-center hover:scale-105 transition-all duration-200 shadow-lg shadow-white/30"
						>
							{user.fullname ? user.fullname.charAt(0).toUpperCase() : "?"}
						</div>

						{/* 🧩 Profile Dropdown */}
						<AnimatePresence>
							{showProfile && (
								<motion.div
									ref={dropdownRef}
									initial={{ opacity: 0, y: -10 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -10 }}
									transition={{ duration: 0.2 }}
									className="absolute right-0 top-14 bg-[#1f1b2e]/95 rounded-2xl border border-white/20 shadow-2xl shadow-white/10 w-64 p-4 backdrop-blur-lg"
								>
									<h3 className="text-lg font-semibold text-white mb-1">
										{user.fullname}
									</h3>
									<p className="text-gray-300 text-sm mb-1">@{user.username}</p>
									<p className="text-gray-300 text-sm mb-3">
										🌐 Language:{" "}
										<span className="text-pink-400 font-medium">
											{user.language || "Not set"}
										</span>
									</p>
									<button
										onClick={handleLogout}
										className="w-full py-2 mt-2 bg-white/90 rounded-full text-black font-semibold hover:bg-white transition-all duration-200"
									>
										Logout
									</button>
								</motion.div>
							)}
						</AnimatePresence>
					</>
				) : (
					<div className="text-gray-200 text-sm">Not logged in</div>
				)}
			</div>
		</nav>
	);
};

export default Navbar;
