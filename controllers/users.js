import { UserModel } from "../models/user-models.js";
import { newUserValidator, loginValidator } from "../validators/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// register a new user
export const registerUser = async (req, res, next) => {
    try {
        const { error, value } = newUserValidator.validate(req.body, { abortEarly: false });
        if (error) {
            return res.status(422).json(error);
        }

        const user = await UserModel.findOne({
            $or: [
                { username: value.username },
                { email: value.email }
            ]
        });

        if (user) {
            return res.status(409).json({ message: "User already exists!" });
        }

        const hashedPassword = bcrypt.hashSync(value.password, 10);
        const newUser = await UserModel.create({
            firstName: value.firstName,
            lastName: value.lastName,
            username: value.username,
            email: value.email,
            role: value.role,
            password: hashedPassword
        });

        // send registration email
        sendEmailSignup(newUser.email, "Welcome to Sign Natural Academy 🎉", newUser.username, newUser.role);

        // generate token
        const accessTokenSignup = jwt.sign(
            { id: newUser.id },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "24h" }
        );

        // return response
        res.status(201).json({
            message: "User created successfully!",
            accessTokenSignup,
        });
    } catch (error) {
        next(error);
    }
};

// login user
export const userLogin = async (req, res, next) => {
    const { error, value } = loginValidator.validate(req.body);
    if (error) {
        return res.status(422).json(error);
    }
    const user = await UserModel.findOne({
        $or: [
            { username: value.username },
            { email: value.email }
        ]
    });
    if (!user) {
        return res.status(404).json({ message: "User not found!" });
    }
    // compare password
    const isPasswordValid = bcrypt.compareSync(value.password, user.password);
    if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid password!" });
    }

    const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET_KEY,
        { expiresIn: '1h' });

    res.status(200).json({ token });
}

// get current user
export const getCurrentUser = async (req, res, next) => {
    try {
        const user = await UserModel.findById(req.user.id).select("username email");
        if (!user) {
            return res.status(400).json({ message: "Invalid user data!" });
        }
        res.status(200).json({ user });
    } catch (error) {
        next(error);
    }
};
// update user profile 
export const updateUserProfile = async (req, res, next) => {
    try {
        const { id } = req.user;
        const updatedUser = await UserModel.findByIdAndUpdate(
            id,
            { $set: req.body },
            { new: true, runValidators: true }
        );
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found!" });
        }
        res.status(200).json({ user: updatedUser });
    }
    catch (error) {
        next(error);
    }
}
// delete user account 
export const deleteUserAccount = async (req, res, next) => {
    try {
        const { id } = req.user;
        const deletedUser = await UserModel.findByIdAndDelete(id);
        if (!deletedUser) {
            return res.status(404).json({ message: "User not found!" });
        }
        res.status(200).json({ message: "User account deleted successfully!" });
    } catch (error) {
        next(error);
    }
};
