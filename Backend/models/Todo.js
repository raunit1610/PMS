import mongoose from "mongoose";

const TodoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Account"
  },
  content: {
    type: String,
    required: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date,
    default: null
  },
  color: {
    type: String,
    default: "#ffd700" // Default yellow sticky note color
  }
}, {
  timestamps: true
});

const Todo = mongoose.model("Todo", TodoSchema);

export default Todo;

