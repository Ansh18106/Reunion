import mongoose from "mongoose";
import Post from "../model/Post.js";
import User from "../model/User.js";
import Comment from "../model/Comment.js";


// a post can be made only when the user is already logged in
export const addPost = async(req, res, next) => {
    const {userId, title, description} = req.body;
    const post = new Post({
        userId,
        title,
        description,
    });
    let existingUser;
    try {
        existingUser = await User.findById(userId);
    } catch (error){
        console.log(error);
    }
    if(!existingUser) {
        return res.status(500).json({ message: "Your daddy have not logged in yet" });
    }
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

export const getAllPosts = async(req, res, next) => {
    const userId = req.params.id;
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
    console.log(userPosts.posts.length);
    return res.status(200).json({ allPosts: posts });
};

export const like = async(req, res, next) => { 
    const postId = req.params.id;
    const currentUserId = "643437c4b02110050aab894a";
    const authenticateUser = await User.findById(currentUserId);
    const post = await Post.findById(postId);
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

export const unlike = async(req, res, next) => { 
    const postId = req.params.id;
    const currentUserId = "643437c4b02110050aab894a";
    const authenticateUser = await User.findById(currentUserId);
    const post = await Post.findById(postId);
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

export const comment = async(req, res, next) => {
    const postId = req.params.id;
    const { content } = req.body;
    const currentUserId = "643437c4b02110050aab894a";
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