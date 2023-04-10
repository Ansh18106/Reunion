import mongoose from "mongoose";

const Schema = mongoose.Schema;

const commentSchema = new Schema({
    parentPost: {
        type: mongoose.Types.ObjectId,
        ref: "Post",
        default: null
    },
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "Profile",
        required: true
    },
    content: {
        type: String,
        required: true
    },
    timestamp: {
        type : Date,
        default: Date.now
    }
});

export default mongoose.model("Comment", commentSchema);

// module.exports = mongoose.model("Tweet", tweetSchema);