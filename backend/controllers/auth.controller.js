import bcrypt from 'bcrypt';
import User from "../models/user.js";

const registerUser = async (req, res) => {
    try {
        const { email, name, password, university, career, currentSemester} = req.body;

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

        // TODO: send email

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

export { registerUser, loginUser };

