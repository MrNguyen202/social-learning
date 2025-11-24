const { text } = require("express");
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Conversation",
        required: true
    },
    senderId: {
        type: String,
        required: true
    },
    content: {
        type: {
            type: String,
            enum: ["text", "image", "file", "video", "audio", "system"],
            required: true,
        },
        text: { type: String },
        images: [{ url: String, filename: String }],
        file: {
            type: {
                url: String,
                filename: String,
                size: Number,
                mimeType: String // video, audio, document, etc.
            },
        },
        system: {
            action: {
                type: String,
                enum: ["user_joined", "user_left", "conversation_renamed", "member_added", "member_removed", "admin_transferred", "conversation_avatar_updated"]
            },
            actor: {
                id: String,
                name: String,
            },
            target: [
                {
                    id: String,
                    name: String,
                },
            ],
            newName: String,
        },
    },
    seens: [
        {
            userId: { type: String, required: true },
            seenAt: { type: Date, default: Date.now }
        }
    ],
    replyTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message"
    },
    likes: [
        {
            userId: String,
            likedAt: Date
        }
    ],
    revoked: { type: Boolean, default: false },
    removed: [
        { userId: String, removedAt: Date }
    ]
}, { timestamps: true });

module.exports = mongoose.model("Message", messageSchema);
