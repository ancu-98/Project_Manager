import mongoose from "mongoose";

const sprintSchema = new  mongoose.Schema(
  {
    backlog: {
      type: mongoose.Schema.Types.ObjectId,
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
    activities: [{ type: mongoose.Schema.Types.ObjectId, ref: "Activity" }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Sprint = mongoose.model("Sprint", sprintSchema);

export default Sprint;
