import { model, Schema } from "mongoose";

const backlogSchema = new Schema(
  {
    project: { type: Schema.Types.ObjectId, ref: "Project", required: true},
    activities: [{ type: Schema.Types.ObjectId, ref: "Activity" }],
    sprint: [{ type: Schema.Types.ObjectId, ref: "Sprint" }],
    storyPointsToDo: { type: Number, min: 0 },
    storyPointsInProgress: { type: Number, min: 0 },
    storyPointsDone: { type: Number, min: 0 },
  },
  { timestamps: true }
);

const Backlog = model("Backlog", backlogSchema);

export default Backlog;
