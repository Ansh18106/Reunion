import mongoose from "mongoose";
import User from "../model/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// login, getUser

export const loginAuthentication = (req) => {
    const token = req.headers.cookie.substr(4);
    let id;
    jwt.verify(token, "this is the Private Key for reunion", (error, decoded) => {
        if (!error) {
            id = decoded.id
        }
        else {
            console.log(error);
        }
    });
    return id;
}


const createToken = (id) => {
    return jwt.sign({ id }, "this is the Private Key for reunion", {});
};

// return data of the user
export const getUser = async(req, res, next) => {
    const userId = loginAuthentication(req);
    let user;
    try {
        user = await User.findById(userId);
    } catch( error ) {
        return next(error);
    }
    if (!user) {
        return res.status(404).json({ message: "No users found" });
    }
    return res.status(200).json({
        name: user.name,
        followers: user.followers.length,
        following: user.following.length
    });
}

// signing up
export const authenticate = async(req, res, next) => {
    const { name, email, password } = await req.body;
    let existingUser;
    const hashedPassword = bcrypt.hashSync(password);
    try {
        existingUser = await User.findOne({ email });
    } catch(error) {
        return console.log(error);
    }

    if (existingUser) {
        return res.status(404).json({ message: "user already exist" });
    }

    const user = new User ({
        name, email, password: hashedPassword
    });

    try {
        await user.save();
    } catch(error) {
        console.log(error);
    }
    return res.status(201).json({ user });
}

export const login = async(req, res, next) => {
    const { email, password } = req.body;
    let existingUser;
    try {
        existingUser = await User.findOne({ email });
    } catch(error) {
        return console.log(error);
    }
    if (!existingUser) {
        return res.status(404).json({ message: "This email is not registered: ("});
    }
    const isPasswordCorrect = bcrypt.compareSync(password, existingUser.password);
    if(!isPasswordCorrect) {
        return res.status(404).json({ message: "Wrong Password! Please try again" });
    }
    const token = createToken(existingUser.id);
    res.cookie('jwt', token, { httpOnly: true });
    return res.status(201).json({ token: token });
}

export const follow = async(req, res, next) => {
    const followingId = req.params.id;
    const followerId = loginAuthentication(req);
    const authenticateUser = await User.findById(followerId);
    const followerUser = await User.findById(followingId);
    const follower = authenticateUser.name;
    const following = followerUser.name;
    try {
        const session = await mongoose.startSession();
        session.startTransaction();
        authenticateUser.following.pull(followingId);
        authenticateUser.following.push(followingId);
        await authenticateUser.save();
        followerUser.followers.pull(followerId);
        followerUser.followers.push(followerId);
        await followerUser.save();
        await session.commitTransaction();
        session.endSession();
    } catch(error) {
        console.log(error);
    }
    return res.status(200).json({ message: `${follower} started following ${following}`})
};

export const unfollow = async(req, res, next) => {
    const followingId = req.params.id;
    const followerId = loginAuthentication(req);
    const authenticateUser = await User.findById(followerId);
    const followerUser = await User.findById(followingId);
    const follower = authenticateUser.name;
    const following = followerUser.name;
    try {
        const session = await mongoose.startSession();
        session.startTransaction();
        authenticateUser.following.pull(followingId);
        await authenticateUser.save();
        followerUser.followers.pull(followerId);
        await followerUser.save();
        await session.commitTransaction();
        session.endSession();
    } catch(error) {
        console.log(error);
    }
    return res.status(200).json({ message: `${follower} has unfollowed ${following}`})
};