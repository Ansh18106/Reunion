import mongoose from "mongoose";
import User from "../model/User.js";
import bcrypt from "bcryptjs";

// login, getUser

// return data of the user
export const getUser = async(req, res, next) => {
    const userId = req.params.id;
    let user;
    try {
        user = await User.findById(userId);
    } catch( error ) {
        return next(error);
    }
    if (!user) {
        return res.status(404).json({ message: "No users found" });
    }
    return res.status(200).json({ user });
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
    return res.status(200).json({ message: "Login Successfully Done"});
}

export const follow = async(req, res, next) => {
    const followingId = req.params.id;
    const followerId = "643437c4b02110050aab894a";
    const authenticateUser = await User.findById(followerId);
    const followerUser = await User.findById(followingId);
    const follower = authenticateUser.name;
    const following = followerUser.name;
    try {
        const session = await mongoose.startSession();
        session.startTransaction();
        // authenticateUser.following.pull(followingId);
        authenticateUser.following.push(followingId);
        await authenticateUser.save();
        // followerUser.followers.pull(followerId);
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
    const followerId = "643437c4b02110050aab894a";
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