import mongoose from "mongoose";

const Schema = mongoose.Schema;

const postSchema = new Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    likes: [{
        type: mongoose.Types.ObjectId,
        ref: "Profile",
    }],
    unlikes: [{
        type: mongoose.Types.ObjectId,
        ref: "Profile",
    }],
    comments: [{
        type: mongoose.Types.ObjectId,
        ref: "Comment",
    }],
    timestamp: {
        type : Date,
        default: Date.now
    }
});

export default mongoose.model("Post", postSchema);