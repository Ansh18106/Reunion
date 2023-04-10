import mongoose from "mongoose";

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    posts: [{
        type: mongoose.Types.ObjectId,
        ref: "Post",
        default: []
    }],
    followers: [{
        type: mongoose.Types.ObjectId,
        ref: "Profile",
        default: []
    }],
    following: [{
        type: mongoose.Types.ObjectId,
        ref: "Profile",
        default: []
    }],
    timestamp: {
        type : Date,
        default: Date.now
    }
});

export default mongoose.model("User", userSchema);