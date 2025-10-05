import { model, Schema } from "mongoose";

const commentSchema = new Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },
    activity: {
      type: Schema.Types.ObjectId,
      ref: "Activity",
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mentions: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User" },
        offset: { type: Number },
        length: { type: Number },
      },
    ],
    reactions: [
      {
        emoji: { type: String },
        user: { type: Schema.Types.ObjectId, ref: "User" },
      },
    ],
    attachments: [
      {
        fileName: { type: String, required: true },
        fileUrl: { type: String, required: true },
        fileType: { type: String },
        fileSize: { type: Number },
        uploadedBy: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    isEdited: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Comment = model("Comment", commentSchema);

export default Comment;
