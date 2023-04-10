import express from "express";
import { getUserData, authenticate, follow, unfollow, signup } from "../controllers/user_controller.js";
import { addPost, comment, deletePost, getAllPosts, getPost, like, unlike } from "../controllers/posts_controller.js";

export const router = express.Router();

router.post("/posts", addPost);
router.get("/posts/:id", getPost);
router.delete("/posts/:id", deletePost);
router.get("/all_posts", getAllPosts);


router.post("/follow/:id", follow);
router.post("/unfollow/:id", unfollow);


router.get("/user", getUserData);
router.post("/createUser", signup); // this will create a new user
router.post("/authenticate", authenticate); 


router.post("/like/:id", like);
router.post("/unlike/:id", unlike);
router.post("/comment/:id", comment);