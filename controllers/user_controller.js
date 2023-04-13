import mongoose from "mongoose";
import User from "../model/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// const tokenExpirationTime = "3600000" // 1 hr
const tokenExpirationTime = ".5h" // 30 mins

// decode id from cookie
export const loginAuthentication = (req) => {
    if (!req.headers.cookie) {
        return null;
    }
    const token = req.headers.cookie.substr(4);
    let id;
    jwt.verify(token, "this is the Private Key for reunion", (error, decoded) => {
        if (!error) {
            id = decoded.id
        } else {
            console.log(17, "please login");
            return null;
        }
    });
    return id;
}

// create jwt token
const createToken = (id) => {
    return jwt.sign({ id }, "this is the Private Key for reunion", {
        expiresIn: tokenExpirationTime
    });
};

// retrieve data of the authenticated user
export const getUserData = async(req, res, next) => {
    console.log("Getting Current User's Data");
    const userId = loginAuthentication(req);
    if (!userId) {
        console.log(userId);
        return res.status(400).json({ message: "Please Login" });
    }
    let user;
    try {
        user = await User.findById(userId);
    } catch( error ) {
        return next(error);
    }
    
    return res.status(200).json({
        name: user.name,
        followers: user.followers.length,
        following: user.following.length
    });
}

// Create New User
export const signup = async(req, res, next) => {
    const { name, email, password } = await req.body;
    let existingUser;
    const hashedPassword = bcrypt.hashSync(password);
    try {
        existingUser = await User.findOne({ email });
    } catch(error) {
        res.status(500).json({ error });
    }
    // Every User Should Have Different EmailIds
    if (existingUser) {
        return res.status(404).json({ message: "user with this emailId already exist" });
    }
    
    const user = new User ({
        name, email, password: hashedPassword
    });
    
    try {
        await user.save();
    } catch(error) {
        res.status(500).json({ error });
    }
    console.log("signed up");
    return res.status(201).json({ user });
}

// Authenticate with emailId and Password
export const authenticate = async(req, res, next) => {
    console.log("logging Up");
    const { email, password } = req.body;
    let existingUser;
    try {
        existingUser = await User.findOne({ email });
    } catch(error) {
        res.status(500).json({ error });
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
    const tokenExpirationCall = setTimeout(() => {
        console.log('Please LogIn');
    }, 30*60*1000);
    console.log("Window is open for 30 mins only");
    return res.status(201).json({ token: token });
}

export const logOut = async(req, res, next) => {
    const userId = loginAuthentication(req);
    if (userId) {
        res.clearCookie('jwt',{
            httpOnly: true,
            sameSite: 'None',
            secure: true
        });
    }
    return res.status(200).json({ message: "Please login" });
}

// authenticate user will follow the user with provided id
export const follow = async(req, res, next) => {
    const followingId = req.params.id;
    const followerId = loginAuthentication(req);
    if (!userId) {
        return res.status(400).json({ message: "Please Login" });
    }
    if (followerId === followingId) {
        return res.status(500).json({ message: "You are following yourself anyways..." });
    }
    const followerUser = await User.findById(followingId);
    const authenticateUser = await User.findById(followerId);
    if (!followerUser) {
        return res.status(404).json({ message: "Invalid Id" });
    }
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
        res.status(500).json({ error });
    }
    return res.status(200).json({ message: `${follower} started following ${following}`})
};


// authenticate user will unfollow the user(if follows) with provided id
export const unfollow = async(req, res, next) => {
    const followingId = req.params.id;
    const followerId = loginAuthentication(req);
    if (!userId) {
        return res.status(400).json({ message: "Please Login" });
    }
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
        res.status(500).json({ error });
    }
    return res.status(200).json({ message: `${follower} has unfollowed ${following}`})
};