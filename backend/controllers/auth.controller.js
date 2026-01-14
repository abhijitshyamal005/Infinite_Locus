import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendVerificationEmail } from "../utils/email.js";
import { successFullVerification } from "../utils/emailTemplate.js";


export const me = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({user});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const register = async (req, res) => {

    try{
        const {username, email, password} = req.body;
        const existingUser = await User.findOne({email});
        if(existingUser) return res.status(400).json({message: `User with email ${email} already exists`});
        const doesUsernameExists = await User.findOne({username});
        if(doesUsernameExists) return res.status(400).json({message: `Username ${username} already exists`});

        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        const hashedPassword = await bcrypt.hash(password, 12);
        await sendVerificationEmail(email.toLowerCase(), verificationCode, username);
        const result = await User.create({
            email,
            password: hashedPassword,
            username,
            verificationCode,
            verificationCodeExpires
        });
        res.status(201).json({user: result, message: `Verification OTP has been sent to ${email}`});
    }catch(error){
        res.status(500).json({message: error.message});
    }

}


export const verifyemail = async (req, res) => {
    try {
        const tokenId = req.params.tokenId;
        const user = await User.findOne({ verificationToken: tokenId });

        if (!user) {
            return res.status(404).json({ error: 'Invalid verification token.' });
        }

        user.isVerified = true;
        user.verificationToken = null;
        await user.save();

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const congratulationContent = successFullVerification(user.username, frontendUrl);

        res.send(congratulationContent);

    } catch (error) {
        res.status(500).json({ error: 'An error occurred during email verification.' });
        console.log(error);
    }
};

export const verifyOtp = async (req, res) => {
    try {
        const { email, code } = req.body;

        if (!email || !code) {
            return res.status(400).json({ message: 'Email and OTP code are required.' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        if (user.isVerified) {
            return res.status(200).json({ message: 'Email already verified.' });
        }

        if (!user.verificationCode || !user.verificationCodeExpires) {
            return res.status(400).json({ message: 'No OTP found. Please request a new one.' });
        }

        if (user.verificationCode !== code) {
            return res.status(400).json({ message: 'Invalid OTP code.' });
        }

        if (user.verificationCodeExpires < new Date()) {
            return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
        }

        user.isVerified = true;
        user.verificationCode = null;
        user.verificationCodeExpires = null;
        await user.save();

        return res.status(200).json({ message: 'Email verified successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred during OTP verification.' });
    }
};

export const login = async (req, res) => {

    try{
        const {email, password} = req.body;
        const existingUser = await User.findOne({email});
        if(!existingUser) return res.status(404).json({message: "User doesn't exist"});
        if(!existingUser.isVerified) return res.status(400).json({message: `Please verify your ${email} first`});
        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
        if(!isPasswordCorrect) return res.status(400).json({message: "Invalid credentials"});
        const token = jwt.sign({email: existingUser.email, id: existingUser._id}, process.env.JWT_SECRET, {expiresIn: "1h"});
        res.status(200).json({user: existingUser, token: token, message: "Logged in successfully"});
    }catch(error){
        res.status(500).json({message: error.message});
    }

}

export const getUsers = async (req, res) => {
    try{
        const users = await User.find();
        res.status(200).json(users);
    }catch(error){
        res.status(500).json({message: error.message});
    }
}
