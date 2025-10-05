import { model, Schema } from "mongoose";

const sprintSchema = new Schema(
  {
    backlog: {
      type: Schema.Types.ObjectId,
      ref: "Backlog",
      required: true,
    },
    sprintName: { type: String, required: true, trim: true, default: 'SCRUM Sprint' },
    duration: {
      type: String,
      enum: ["1 week", "2 weeks", "3 weeks", "4 weeks", "customized"],
      default: 'customized',
      required: true,
    },
    startDay: { type: Date, required: true },
    finishDay: { type: Date, required: true },
    sprintGoal: { type: String },
    storyPointsToDo: { type: Number, min: 0 },
    storyPointsInProgress: { type: Number, min: 0 },
    storyPointsDone: { type: Number, min: 0 },
    activities: [{ type: Schema.Types.ObjectId, ref: "Activity" }],
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Sprint = model("Sprint", sprintSchema);

export default Sprint;
