import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import userMiddleware from "../middlewares/User.js";
import { JWT_SECRET } from "../config.js";

const router = express.Router();

// --------------------------- LOGIN ---------------------------
router.post("/login", async (req, res) => {
	const { username, password } = req.body;
	try {
		const user = await User.findOne({ username });
		if (!user)
			return res.status(401).json({ msg: "Invalid username or password" });

		const isValid = await bcrypt.compare(password, user.password);
		if (!isValid)
			return res.status(401).json({ msg: "Invalid username or password" });

		const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "7d" });
		res.json({ token });
	} catch (err) {
		res.status(500).json({ msg: "Error logging in" });
	}
});

// --------------------------- REGISTER ---------------------------
router.post("/register", async (req, res) => {
	const { fullname, username, password } = req.body;
	try {
		const existingUser = await User.findOne({ username });
		if (existingUser)
			return res.status(403).json({ msg: "Username already taken." });

		const newUser = new User({ fullname, username, password });
		await newUser.save();

		const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "7d" });
		res.status(201).json({ msg: "User registered successfully!", token });
	} catch (err) {
		res.status(400).json({ msg: "Registration failed" });
	}
});

// --------------------------- FIND USER ---------------------------
router.get("/find", async (req, res) => {
	const { username } = req.query;
	try {
		const existingUser = await User.findOne({ username });
		res.status(200).json({ isUser: !!existingUser });
	} catch (err) {
		res.status(500).json({ msg: "Internal error" });
	}
});

// --------------------------- GET USER ---------------------------
router.get("/user", userMiddleware, async (req, res) => {
	try {
		const user = await User.findOne({ username: req.username });
		if (!user) return res.status(404).json({ msg: "User not found" });
		res.json({
			fullname: user.fullname,
			username: user.username,
			language: user.language,
		});
	} catch (err) {
		res.status(500).json({ msg: "Internal Error" });
	}
});

// --------------------------- UPDATE LANGUAGE ---------------------------
router.patch("/language", userMiddleware, async (req, res) => {
	try {
		const { language } = req.body;
		if (!language) return res.status(400).json({ msg: "Language is required" });

		const updatedUser = await User.findOneAndUpdate(
			{ username: req.username },
			{ language },
			{ new: true }
		);

		if (!updatedUser) return res.status(404).json({ msg: "User not found" });

		res.status(200).json({
			msg: "Language updated successfully",
			language: updatedUser.language,
		});
	} catch (err) {
		console.error("Language update error:", err);
		res.status(500).json({ msg: "Internal Server Error" });
	}
});

export default router;
