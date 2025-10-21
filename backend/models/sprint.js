import mongoose from "mongoose";

const sprintSchema = new  mongoose.Schema(
  {
    backlog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Backlog",
      required: true,
    },
    sprintName: { type: String, trim: true, default: 'SCRUM Sprint' },
    duration: {
      type: String,
      enum: ["1 week", "2 weeks", "3 weeks", "4 weeks", "customized"],
      default: 'customized',
    },
    startDay: { type: Date},
    finishDay: { type: Date},
    sprintGoal: { type: String },
    storyPointsToDo: { type: Number, min: 0 },
    storyPointsInProgress: { type: Number, min: 0 },
    storyPointsDone: { type: Number, min: 0 },
    activities: [{ type: mongoose.Schema.Types.ObjectId, ref: "Activity" }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    startedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User"},
    isStarted: { type: Boolean, default: false},
    finishedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User"},
    isFinished: { type: Boolean, default: false},
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Sprint = mongoose.model("Sprint", sprintSchema);

export default Sprint;
