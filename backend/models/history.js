import mongoose from "mongoose";

const historyLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        "created_activity",
        "updated_activity",
        "created_subtask",
        "updated_subtask",
        "completed_activity",
        "created_project",
        "updated_project",
        "completed_project",
        "created_workspace",
        "updated_workspace",
        "added_comment",
        "added_member",
        "removed_member",
        "joined_workspace",
        "accepted_join_request",
        "rejected_join_request",
        "transferred_workspace_ownership",
        "deleted_workspace",
        "added_attachment",
      ],
    },
    resourceType: {
      type: String,
      required: true,
      enum: ["Activity", "Project", "Workspace", "Comment", "User"],
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    details: {
      type: Object,
    },
  },
  { timestamps: true }
);

const HistoryLog = mongoose.model('HistoryLog', historyLogSchema)

export default HistoryLog;