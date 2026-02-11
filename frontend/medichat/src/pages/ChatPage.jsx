import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ChatContainer from "../components/ChatContainer";
import InputBox from "../components/InputBox";
import Navbar from "../components/Navbar";
import ChatSidebar from "../components/ChatSidebar";
import { getUser, getChatByThreadId } from "../api/authAPI";
import { motion } from "framer-motion";

const ChatPage = () => {
  const { threadId } = useParams();
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  const [messages, setMessages] = useState([]);
  const [language, setLanguage] = useState("English");
  const [activeThread, setActiveThread] = useState(threadId || null);
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await getUser();
        setLanguage(data.language || "English");
      } catch (err) {
        console.error("chat getUser error:", err.message);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    if (!threadId) {
      const newId =
        Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
      setActiveThread(newId);
      navigate(`/chat/${newId}`, { replace: true });
    }
  }, [threadId, navigate]);

  useEffect(() => {
    if (!activeThread) return;
    const loadThread = async () => {
      try {
        const data = await getChatByThreadId(activeThread);
        setMessages(data.messages || data);
      } catch {
        setMessages([]);
      }
    };
    loadThread();
  }, [activeThread]);

  useEffect(() => {
    if (activeThread && threadId !== activeThread) {
      navigate(`/chat/${activeThread}`, { replace: true });
    }
  }, [activeThread, threadId, navigate]);

  const handleNewChat = () => {
    const newId =
      Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
    setActiveThread(newId);
    setMessages([]);
    navigate(`/chat/${newId}`);
  };

  const handleSend = async (text) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("Session expired. Please log in again.");
      window.location.href = "/auth";
      return;
    }
    if (!activeThread) {
      handleNewChat();
      return;
    }

    const userMsg = { role: "user", text };
    setMessages((prev) => [
      ...prev,
      userMsg,
      { role: "assistant", text: "Thinking..." },
    ]);

    try {
      const response = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          threadId: activeThread,
          message: text,
          language,
        }),
      });
      const data = await response.json();
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "assistant", text: data.message },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "assistant", text: "⚠️ Error connecting to server." },
      ]);
    }
  };

  const sidebarExpandedWidth = 256;
  const sidebarMinWidth = 64;

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-b from-[#1E1B4B] via-[#2E1A47] to-[#3F1A54] text-white transition-all duration-300">
      {/* Navbar */}
      <Navbar language={language} setLanguage={setLanguage} />

      {/* Main Layout */}
      <div className="flex flex-1 pt-20 transition-all duration-500">
        {/* Sidebar */}
        <ChatSidebar
          activeThread={activeThread}
          setActiveThread={setActiveThread}
          onNewChat={handleNewChat}
          isMinimized={isSidebarMinimized}
          setIsMinimized={setIsSidebarMinimized}
        />

        {/* Chat Section */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex-1 flex flex-col justify-between rounded-3xl shadow-[0_0_20px_rgba(150,100,255,0.2)] backdrop-blur-md bg-[#2B1B45]/70 border border-[#7042f861] mx-6 mb-6 overflow-hidden"
          style={{
            marginLeft: isSidebarMinimized
              ? `${sidebarMinWidth}px`
              : `${sidebarExpandedWidth}px`,
          }}
        >
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4 scrollbar-thin scrollbar-thumb-[#a855f7]/50 scrollbar-track-transparent">
            <ChatContainer messages={messages} />
          </div>

          {/* Input Box */}
          <div className="border-t border-[#7042f861] bg-[#2a1742]/70 px-6 py-4 backdrop-blur-lg shadow-inner">
            <InputBox
              onSend={handleSend}
              sidebarOffset={
                isSidebarMinimized ? sidebarMinWidth : sidebarExpandedWidth
              }
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ChatPage;
