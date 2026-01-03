import mongoose from "mongoose";

const DiarySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Account"
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  title: {
    type: String,
    default: ""
  },
  content: {
    type: String,
    required: true
  },
  mood: {
    type: String,
    enum: ["happy", "sad", "excited", "anxious", "calm", "angry", "neutral"],
    default: "neutral"
  }
}, {
  timestamps: true
});

// Index to ensure one entry per user per day
DiarySchema.index({ userId: 1, date: 1 }, { unique: true });

const Diary = mongoose.model("Diary", DiarySchema);

export default Diary;

