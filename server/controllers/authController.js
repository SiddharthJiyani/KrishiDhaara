import UserData from "../models/userData.js";
import { generateToken,verifyToken } from "../config/jwt.js";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

export const signUp = async(req,res) => {
    try {
        const {fullName, email, password} = req.body;
        if (!fullName || !email || !password) {
            return res.status(400).send({ 
                success: false, 
                message: "All fields are required: fullName, email, password" 
            });
        }
        const existingUser = await UserData.findOne({ email });
        if (existingUser) {
            return res.status(400).send({ 
                success: false, 
                message: "Email already registered" 
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new UserData({
            fullName,
            email,
            password: hashedPassword
        });
        await newUser.save();

        return res.status(201).send({
            success: true,
            message: "User registered successfully"
        });

    } catch (error) {
        console.log(error)
        return res.status(500).send({ "success": false, "message": "Internal server error" });
    }
}

export const login = async(req,res) => {
    try {
        
        const {email,password} = req.body;

        if (!email || !password) {
            return res.status(400).send({ 
                success: false, 
                message: "Email and password are required" 
            });
        }
        
        const user = await UserData.findOne({ email });
        if (!user) {
            return res.status(404).send({ 
                success: false, 
                message: "User not found" 
            });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).send({ 
                success: false, 
                message: "Invalid password" 
            });
        }

        const expiryTime = 24 * 60 * 60 * 1000;
        const expiresAt = new Date(Date.now() + expiryTime);
        const token = generateToken({ id: user._id });

        // res.cookie('token', token, {
        //     httpOnly: true,
        //     secure: process.env.NODE_ENV === 'production',
        //     sameSite: 'none',
        //     path:'/',
        //     maxAge: expiryTime 
        // });

        return res.status(200).send({
            success: true,
            message: "Login successful",
            expiresAt,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email
            },
            token
        });
    } catch (error) {
        console.log(error)
        return res.status(500).send({ "success": false, "message": "Internal server error" });
    }
}

export const logout = async(req,res) => {
    try {
        // res.clearCookie('token', {
        //     httpOnly: true,
        //     secure: process.env.NODE_ENV === 'production',
        //     sameSite: 'none'
        // });
        // const token = req.cookies.token;
        return res.status(200).send({
            success: true,
            message: "Logged out successfully"
        });
    } catch (error) {
        console.log(error)
        return res.status(500).send({ "success": false, "message": "Internal server error" });
    }
}

export const checkIsLoggedIn = async(req,res) => {
    try {

        let token;
        if (req.headers.authorization) {
            // Extract token from "Bearer <token>" format
            const authHeader = req.headers.authorization;
            // console.log(authHeader)
            if (authHeader.startsWith('Bearer ')) {
                // Get token part and remove any quotes if present
                token = authHeader.substring(7).replace(/^"(.*)"$/, '$1');
            } else {
                // Remove quotes if present
                token = authHeader.replace(/^"(.*)"$/, '$1');
            }
        }

        if(!token) {
            return res.status(400).send({"success":false,"message":"Authentication token not found"});
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const user = await UserData.findById(decoded.id.id);
        console.log(user)
        if(!user) {
            return res.status(400).send({"success":false,"message":"Invalid Token"});
        }
        return res.status(200).send({"success":true,"message":"Valid token found"});
    } catch (error) {
        console.log(error)
        return res.status(500).send({ "success": false, "message": "Internal server error" });
    }
}