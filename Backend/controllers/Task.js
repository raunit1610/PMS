import Task from "../models/Task.js";
import mongoose from "mongoose";

// Calculate priority based on date difference
function calculatePriority(dueDate) {
  const now = new Date();
  const due = new Date(dueDate);
  const diffTime = due - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return "urgent"; // Overdue
  if (diffDays === 0) return "urgent"; // Due today
  if (diffDays <= 2) return "high";
  if (diffDays <= 7) return "medium";
  return "low";
}

// GET /feature/tasks - Get all tasks for a user
async function handleTasksGet(req, res) {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({
        message: "userId is required"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        message: "Invalid userId format"
      });
    }

    const tasks = await Task.find({ userId }).sort({ dueDate: 1, createdAt: -1 });
    
    // Calculate and update priority for each task
    const tasksWithPriority = tasks.map(task => {
      const calculatedPriority = calculatePriority(task.dueDate);
      if (task.priority !== calculatedPriority) {
        // Update priority in database (async, don't wait)
        Task.findByIdAndUpdate(task._id, { priority: calculatedPriority }).catch(console.error);
      }
      return {
        ...task.toObject(),
        priority: calculatedPriority
      };
    });
    
    res.status(200).json(tasksWithPriority);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

// POST /feature/tasks - Create a new task
async function handleTaskPost(req, res) {
  try {
    const { userId, title, description, dueDate, status } = req.body;

    if (!userId || !title || !dueDate) {
      return res.status(400).json({
        message: "userId, title, and dueDate are required"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        message: "Invalid userId format"
      });
    }

    const priority = calculatePriority(dueDate);

    const task = await Task.create({
      userId,
      title,
      description: description || "",
      dueDate,
      priority,
      status: status || "pending"
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

// PUT /feature/tasks/:id - Update a task
async function handleTaskPut(req, res) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid task id format"
      });
    }

    // If dueDate is being updated, recalculate priority
    if (updateData.dueDate) {
      updateData.priority = calculatePriority(updateData.dueDate);
    }

    // If status is being set to completed, set completedAt
    if (updateData.status === "completed" && !updateData.completedAt) {
      updateData.completedAt = new Date();
    } else if (updateData.status !== "completed") {
      updateData.completedAt = null;
    }

    const task = await Task.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    // Recalculate priority if dueDate exists
    if (task.dueDate) {
      task.priority = calculatePriority(task.dueDate);
      await task.save();
    }

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

// DELETE /feature/tasks/:id - Delete a task
async function handleTaskDelete(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid task id format"
      });
    }

    const deletedTask = await Task.findByIdAndDelete(id);
    if (!deletedTask) {
      return res.status(404).json({ message: "Task not found" });
    }
    
    return res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

// DELETE /feature/tasks/delete-all - Delete all tasks for a user
async function handleDeleteAllTasks(req, res) {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        message: "userId is required"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        message: "Invalid userId format"
      });
    }

    const result = await Task.deleteMany({ userId });
    
    res.status(200).json({
      message: "All tasks deleted successfully",
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

export {
  handleTasksGet,
  handleTaskPost,
  handleTaskPut,
  handleTaskDelete,
  handleDeleteAllTasks
};

