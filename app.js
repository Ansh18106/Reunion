import express from "express";
import mongoose from "mongoose";
// import { userRouter } from "./routers/user_route.js";
// import { postRouter } from "./routers/posts_route.js";
import { router } from "./routers/route.js";

const app = express();
// const mongoURL = "mongodb://localhost:27017/Reunion";
const mongoURL = "mongodb+srv://anshbansal18106:tw3HQK8NelYX1mgP@cluster0.jstwolr.mongodb.net/?retryWrites=true&w=majority";
const PORT = 2000;

app.use(express.json());
app.use("/api", router);

// mongoose.set("strictQuery", false);
mongoose.connect(mongoURL)
.then(app.listen(PORT, () => console.log(`Express Running on ${PORT}`)))
.catch((err) => console.log("Error -> ", err));

app.use("/", (req, res, next) => {
    res.send("expresssssssss!!!");
});