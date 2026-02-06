import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// REGISTER
export const register = async (req, res, next) => {
    try {
        const { name, username, email, password, role } = req.body;

        if (!name || !username || !email || !password) {
            res.status(400);
            throw new Error("Please provide name, username, email and password");
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            res.status(400);
            throw new Error("User already exists");
        }

        const usernameExists = await User.findOne({ username });
        if (usernameExists) {
            res.status(400);
            throw new Error("Username already taken");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const roles = role ? [role.toUpperCase()] : ["CLIENT"];

        const user = await User.create({
            name,
            username,
            email,
            password: hashedPassword,
            role: roles,
        });

        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isApproved: user.isApproved
            },
        });
    } catch (error) {
        next(error);
    }
};

// LOGIN
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400);
            throw new Error("Please provide email and password");
        }

        const user = await User.findOne({ email });
        if (!user) {
            res.status(401);
            throw new Error("Invalid email or password");
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            res.status(401);
            throw new Error("Invalid email or password");
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isApproved: user.isApproved
            },
        });
    } catch (error) {
        next(error);
    }
};
