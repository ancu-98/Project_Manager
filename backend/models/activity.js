import { model, Schema } from "mongoose";

const activitySchema = new Schema(
  {
    typeOf: {
        type: String,
        enum: ['Epic','History', 'Task', 'Subtask'],
        default: 'Task',
        required: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    relatedActivities: [{ type: Schema.Types.ObjectId, ref: "Activity" }],
    backlog: {
      type: Schema.Types.ObjectId,
      ref: "Backlog",
      required: true,
    },
    status: {
      type: String,
      enum: ["To Do", "In Progress", "Review", "Done"],
      default: "To Do",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    principal: { type: Schema.Types.ObjectId, ref: "Activity" },
    assignees: [{ type: Schema.Types.ObjectId, ref: "User" }],
    watchers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    dueDate: { type: Date },
    completedAt: { type: Date },
    sprint: { type: Schema.Types.ObjectId, ref: "Sprint" },
    storyPointEstimate: { type: Number, min: 0 },
    estimatedHours: { type: Number, min: 0 },
    actualHours: { type: Number, min: 0 },
    tags: [{ type: String }],
    subtasks: [
      {
        title: {
          type: String,
          requiered: true,
        },
        completed: {
          type: Boolean,
          default: false,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
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
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Activity = model("Activity", activitySchema);

export default Activity;
