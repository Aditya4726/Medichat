import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import hero from "../assets/hero.png";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden text-white bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#4c1d95]">
      {/* 🔮 Floating glow background */}
      <motion.div
        className="absolute w-[500px] h-[500px] bg-indigo-600/30 rounded-full blur-[150px] top-[-10rem] left-[-10rem]"
        animate={{ x: [0, 30, 0], y: [0, 30, 0] }}
        transition={{ repeat: Infinity, duration: 12, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-[500px] h-[500px] bg-fuchsia-600/30 rounded-full blur-[150px] bottom-[-10rem] right-[-10rem]"
        animate={{ x: [0, -30, 0], y: [0, -30, 0] }}
        transition={{ repeat: Infinity, duration: 14, ease: 'easeInOut' }}
      />

      {/* 🌟 Foreground Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6">
        <motion.h1
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-5xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-pink-400 to-purple-300 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]"
        >
          MediChat
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 1 }}
          className="italic text-white/80 text-xl md:text-2xl mb-12"
        >
          “Empowering better health through AI conversations with Multilanguages 💬”
        </motion.p>

        <motion.img
          src={hero}
          alt="AI Health Assistant"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="w-[90%] md:w-[600px] rounded-3xl shadow-[0_0_40px_rgba(255,255,255,0.2)] mb-12 border border-white/20"
        />

        <motion.button
          whileHover={{
            scale: 1.05,
            boxShadow: "0 0 30px rgba(255,255,255,0.4)",
          }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/auth")}
          className="bg-white/10 hover:bg-white/20 text-white font-semibold px-12 py-4 rounded-full backdrop-blur-lg border border-white/30 shadow-lg transition-all duration-300"
        >
          Start Chat
        </motion.button>
      </div>

      {/* ✨ Subtle overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10 pointer-events-none" />
    </div>
  );
};

export default LandingPage;
