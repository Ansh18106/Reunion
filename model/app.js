import express from "express";
import mongoose from "mongoose";
// import { userRouter } from "./routers/user_route.js";
// import { postRouter } from "./routers/posts_route.js";
import { router } from "./routers/route.js";

const app = express();
const mongoURL = "mongodb://localhost:27017/Reunion";

app.use(express.json());
app.use("/api", router);

// mongoose.set("strictQuery", false);
mongoose.connect(mongoURL)
.then(app.listen(2000, () => console.log("Connected to Express")))
.catch((err) => console.log("Error -> ", err));

app.use("/", (req, res, next) => {
    res.send("expresssssssss!!!");
});