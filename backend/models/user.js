import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: { type: String, required: true, select: false },
    name: { type: String, required:true, trim: true},
    profilePicture: { type:String },
    university: {type: String, required: true},
    career: { type: String, required: true},
    currentSemester: { type: Number, required: true, default: 1},
    isEmailVerified: { type: Boolean, default: false },
    lastLogin: { type:Date },
    is2FAEnabled: { type: Boolean, default: false },
    twoFAOtp: { type: String, select: false  },
    twoFAOtpExpires: { type: Date, select: false },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

export default User;