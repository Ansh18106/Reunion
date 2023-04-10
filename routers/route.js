import express from "express";
import { getUser, login, authenticate, follow, unfollow } from "../controllers/user_controller.js";
import { addPost, comment, deletePost, getAllPosts, getPost, like, unlike } from "../controllers/posts_controller.js";

export const router = express.Router();

router.post("/posts", addPost);
router.get("/posts/:id", getPost);
router.delete("/posts/:id", deletePost);
router.get("/all_posts/:id", getAllPosts);


router.post("/follow/:id", follow);
router.post("/unfollow/:id", unfollow);


router.get("/user/:id", getUser); // return the data of the user of userId = id
router.post("/authenticate", authenticate); // this will create a new user with some of its properties
router.post("/user", login); // login


router.post("/like/:id", like);
router.post("/unlike/:id", unlike);
router.post("/comment/:id", comment);