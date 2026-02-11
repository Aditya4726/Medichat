import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

// User Schema
const UserSchema = new mongoose.Schema({
	fullname: {
		type: String,
		required: true,
	},
	username: {
		type: String,
		required: true,
		unique: true,
	},
	password: {
		type: String,
		required: true,
	},
	premium: {
		type: Boolean,
		default: false,
	},
	apiKey: {
		type: String,
		default: null,
	},
	language: {
		type: String,
		required: true,
		default: "English",
	},
});

// Middleware to hash password and generate API key
UserSchema.pre("save", async function (next) {
	if (this.isModified("password")) {
		this.password = await bcrypt.hash(this.password, 10);
	}
	if (this.premium && !this.apiKey) {
		let uniqueApiKey;
		let collisionDetected = true;

		while (collisionDetected) {
			uniqueApiKey = uuidv4();

			const existingUser = await mongoose
				.model("User")
				.findOne({ apiKey: uniqueApiKey });
			if (!existingUser) {
				collisionDetected = false;
			}
		}
		this.apiKey = uniqueApiKey;
	}
	next();
});

export default mongoose.model("User", UserSchema);
