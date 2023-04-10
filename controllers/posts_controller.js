import mongoose from "mongoose";
import Post from "../model/Post.js";
import User from "../model/User.js";
import Comment from "../model/Comment.js";
import { loginAuthentication } from "./user_controller.js"


// Create New Post
export const addPost = async(req, res, next) => {
    const userId = loginAuthentication(req);
    const { title, description } = req.body;
    const post = new Post({
        userId,
        title,
        description,
    });
    const existingUser = await User.findById(userId);
    try{
        // Many to one relation
        const session = await mongoose.startSession();
        session.startTransaction();
        await post.save();
        existingUser.posts.push(post);
        await existingUser.save();
        await session.commitTransaction();
        session.endSession();
    } catch(error) {
        console.log(error);
        return res.status(500).json({ message: error });
    }
    return res.status(200).json({
        id: post.id,
        title: post.title,
        description: post.description,        
        creation_date: post.timestamp.toLocaleDateString(),
        creation_time: post.timestamp.toLocaleTimeString(),                             
    });
};

// Retrieve The Post With The Provided Id
export const getPost = async(req, res, next) => {
    const postId = req.params.id;
    let post;
    try {
        post = await Post.findById(postId);
    } catch (error) {
        console.log(error);
    }
    if(!post) {
        return res.status(500).json({ message: "What is this Post? You check first :(" });
    }
    return res.status(200).json({
        id: post.id,
        title: post.title,
        description: post.description,
        time: post.timestamp,
        likes: post.likes.length,
        comments: post.comments        
    });
};

// Delete The Post With The Provided Id
export const deletePost = async(req, res, next) => {
    const postId = req.params.id;
    let post;
    try {
        post = await Post.findByIdAndDelete(postId).populate("userId");
        await post.userId.posts.pull(post);
        await post.userId.save();
    } catch (error) {
        console.log(error);
    }
    return res.status(200).json({ post });
};

// Return All The Posts Created By The Authenticated User
export const getAllPosts = async(req, res, next) => {
    const userId = loginAuthentication(req);
    let userPosts;
    try {
        userPosts = await User.findById(userId).populate("posts");
    } catch(error) {
        console.log(error);
    }
    if (!userPosts) {
        return res.status(404).json({ message: "User not found" });
    }
    let posts = [];
    
    for(var i = 0; i < userPosts.posts.length; ++ i) {
        posts.push({
            id: userPosts.posts[i].id,
            title: userPosts.posts[i].title,
            description: userPosts.posts[i].description,
            creation_date: userPosts.posts[i].timestamp.toLocaleDateString(),
            creation_time: userPosts.posts[i].timestamp.toLocaleTimeString(),
            comments: userPosts.posts[i].comments,
            likes: userPosts.posts[i].likes.length,
        });
    }
    return res.status(200).json({ allPosts: posts });
};

// Authenticated User Likes The Post Of Provided Id
export const like = async(req, res, next) => { 
    const currentUserId = loginAuthentication(req);
    const authenticateUser = await User.findById(currentUserId);
    const postId = req.params.id;
    let post;
    try {
        post = await Post.findById(postId);
    } catch(error) {
        return res.status(404).json({ message: "Posts not Found" }, error);
    }
    const name = authenticateUser.name;
    const title = post.title;
    try {
        const session = await mongoose.startSession();
        session.startTransaction();
        post.unlikes.pull(currentUserId);
        post.likes.pull(currentUserId);
        post.likes.push(currentUserId);
        await post.save();
        await session.commitTransaction();
        session.endSession();
    } catch(error) {
        console.log(error);
    }
    return res.status(200).json({ message: `${name} liked ${title}`})
};

// Authenticated User Unlikes The Post Of Provided Id
export const unlike = async(req, res, next) => { 
    const currentUserId = loginAuthentication(req);
    const authenticateUser = await User.findById(currentUserId);
    const postId = req.params.id;
    let post;
    try {
        post = await Post.findById(postId);
    } catch(error) {
        return res.status(404).json({ message: "Posts not Found" }, error);
    }
    const name = authenticateUser.name;
    const title = post.title;
    try {
        const session = await mongoose.startSession();
        session.startTransaction();
        // await authenticateUser.save();
        post.likes.pull(currentUserId);
        post.unlikes.pull(currentUserId);
        post.unlikes.push(currentUserId);
        await post.save();
        await session.commitTransaction();
        session.endSession();
    } catch(error) {
        console.log(error);
    }
    return res.status(200).json({ message: `${name} unliked ${title}`})
};

// Authenticated User Make a Comment On The Post Of Provided Id
export const comment = async(req, res, next) => {
    const postId = req.params.id;
    const { content } = req.body;
    const currentUserId = loginAuthentication(req);
    const authenticateUser = await User.findById(currentUserId);
    const post = await Post.findById(postId);
    const name = authenticateUser.name;
    const title = post.title;
    const comment = new Comment({
        parentPost: postId,
        userId: currentUserId,
        content
    })
    try {
        const session = await mongoose.startSession();
        session.startTransaction();
        await post.comments.push(comment.id);
        await post.save();
        await comment.save();
        await session.commitTransaction();
        session.endSession();
    } catch(error) {
        console.log(error);
        return res.status(500).json({ message: error });
    }
    if (!comment) {
        return res.status(500).json({ message: "couldn't created a comment." });
    }
    return res.status(200).json({ comment_id: comment.id})
};