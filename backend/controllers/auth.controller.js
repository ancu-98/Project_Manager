import bcrypt from 'bcrypt';
import User from "../models/user.js";
import Verification from '../models/verification.js';
import jwt from 'jsonwebtoken';
import { sendEmail } from '../libs/send.email.js';
import aj from '../libs/arcjet.js';

const registerUser = async (req, res) => {
    try {
        const { email, name, password, university, career, currentSemester} = req.body;

        // Adding Arcjet email validator
        const decision = await aj.protect(req, { email });
        console.log("Arcjet decision", decision.isDenied());

        if (decision.isDenied()) {
            res.writeHead(403, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ message: "Invalid email address" }));
        }
        // Adding Arcjet email validator

        const existingUser = await User.findOne({ email });

        if (existingUser){
            return res.status(400).json({
                message: 'Email address already in use',
            })
        }

        const salt = await  bcrypt.genSalt(10);

        const hashPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            email,
            password: hashPassword,
            name,
            university,
            career,
            currentSemester
        });

        const verificationToken = jwt.sign(
            {userId: newUser._id, porpuse: 'email-verification'},
            process.env.JWT_SECRET,
            { expiresIn: '1h'}
        )

        await Verification.create({
            userId: newUser.id,
            token: verificationToken,
            expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000),
        })

        //send email
        const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
        const emailBody = `<p>Click <a href='${verificationLink}'>here</a> to verify your email</p>`;
        const emailSubject = 'Verify your email';

        const isEmailSent = await sendEmail(email, emailSubject, emailBody);

        if(!isEmailSent) {
            return res.status(500).json({
                message: 'failed to send verification email'
            })
        }

        res.status(201).json({
            message: 'Verification sent to your email. Please check and verify your account.',
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({message: 'Internal Server error'});

    }

};

const loginUser = async (req, res) => {
    try {

    } catch (error) {
        console.log(error);

        res.status(500).json({message: 'Internal Server error'});

    }


};

const verifyEmail = async (req, res) => {
    try {
        const { token } = req.body;

        const payload = jwt.verify(token, process.env.JWT_SECRET);

        if (!payload) {
            return res.status(401).json({ message: 'Unauthorized'});
        }

        const { userId, porpuse } = payload;

        if (porpuse !== 'email-verification') {
            return res.status(401).json({ message: 'Unauthorized'});
        }

        const verification = await Verification.findOne({
            userId,
            token,
        });

        if (!verification) {
            return res.status(401).json({ message: 'Unauthorized'});
        }

        const isTokenExpired = verification.expiresAt < new Date();

        if (isTokenExpired) {
            return res.status(401).json({ message: 'Token expired'});
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(401).json({ message: 'Unauthorized'});
        }

        if (user.isEmailVerified) {
            return res.status(400).json({ message: 'Email already verified'});
        }

        user.isEmailVerified = true;
        await user.save();

        await Verification.findByIdAndDelete(verification._id);

        res.status(200).json({ message: 'Email verified successfully'});

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal Server error'})
    }
}

export { registerUser, loginUser, verifyEmail };

