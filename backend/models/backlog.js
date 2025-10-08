import mongoose from "mongoose";

const backlogSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true},
    activities: [{ type: mongoose.Schema.Types.ObjectId, ref: "Activity" }],
    sprints: [{ type: mongoose.Schema.Types.ObjectId, ref: "Sprint" }],
    storyPointsToDo: { type: Number, min: 0 },
    storyPointsInProgress: { type: Number, min: 0 },
    storyPointsDone: { type: Number, min: 0 },
  },
  { timestamps: true }
);

const Backlog = mongoose.model("Backlog", backlogSchema);

export default Backlog;
