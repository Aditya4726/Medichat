// import apiClient from "./apiClient";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const apiClient = axios.create({
	baseURL: API_BASE,
	headers: {
		"Content-Type": "application/json",
	},
});


// login
export const loginUser = async (username, password) => {
	try {
		const response = await apiClient.post("/user/login", {
			username,
			password,
		});
		return response.data.token; // backend returns { token }
	} catch (error) {
		const err =
			error.response?.data?.msg || error.message || "Error logging in";
		throw new Error(err);
	}
};

// register
export const registerUser = async (fullname, username, password) => {
	try {
		const response = await apiClient.post("/user/register", {
			fullname,
			username,
			password,
		});
		return response.data.token;
	} catch (error) {
		const err =
			error.response?.data?.msg || "Registration failed. Please try again.";
		throw new Error(err);
	}
};

// find user
export const findUser = async (username) => {
	try {
		const response = await apiClient.get("/user/find", {
			params: { username },
		});
		return response.data;
	} catch (error) {
		const err = error.response?.data?.msg || "Error finding user";
		throw new Error(err);
	}
};

// get user
export const getUser = async () => {
	const authToken = localStorage.getItem("authToken");
	if (!authToken) throw new Error("No token found. Please log in again.");

	try {
		const response = await apiClient.get("/user/user", {
			headers: { Authorization: `Bearer ${authToken}` },
		});
		return response.data; // { fullname, username, language }
	} catch (error) {
		if (error.response?.status === 401) {
			localStorage.removeItem("authToken");
			localStorage.removeItem("user");
			window.location.href = "/auth";
		}
		throw new Error(error.response?.data?.msg || "Error fetching user data");
	}
};

// update language
export const updateUserLanguage = async (language) => {
	const token = localStorage.getItem("authToken");
	if (!token) throw new Error("No token found");
	const res = await apiClient.patch(
		"/user/language",
		{ language },
		{ headers: { Authorization: `Bearer ${token}` } }
	);
	return res.data;
};


// -----------------------------chat history -----------------------------------

// Fetch all previous chat threads
export const getChatHistory = async () => {
	const token = localStorage.getItem("authToken");
	const res = await apiClient.get("/chat/history", {
		headers: { Authorization: `Bearer ${token}` },
	});
	return res.data;
};

// Fetch messages for a specific thread
export const getChatByThreadId = async (threadId) => {
	const token = localStorage.getItem("authToken");
	const res = await apiClient.get(`/chat/${threadId}`, {
		headers: { Authorization: `Bearer ${token}` },
	});
	return res.data;

};
