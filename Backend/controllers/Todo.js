import Todo from "../models/Todo.js";
import mongoose from "mongoose";

// GET /feature/todos - Get all todos for a user
async function handleTodosGet(req, res) {
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

    const todos = await Todo.find({ userId }).sort({ createdAt: -1 });
    
    res.status(200).json(todos);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

// POST /feature/todos - Create a new todo
async function handleTodoPost(req, res) {
  try {
    const { userId, content, color } = req.body;

    if (!userId || !content) {
      return res.status(400).json({
        message: "userId and content are required"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        message: "Invalid userId format"
      });
    }

    const todo = await Todo.create({
      userId,
      content,
      color: color || "#ffd700",
      isCompleted: false
    });

    res.status(201).json(todo);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

// PUT /feature/todos/:id - Update a todo (toggle complete or update content)
async function handleTodoPut(req, res) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid todo id format"
      });
    }

    // If toggling completion status
    if (updateData.isCompleted !== undefined) {
      if (updateData.isCompleted) {
        updateData.completedAt = new Date();
      } else {
        updateData.completedAt = null;
      }
    }

    const todo = await Todo.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!todo) {
      return res.status(404).json({
        message: "Todo not found"
      });
    }

    res.status(200).json(todo);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

// DELETE /feature/todos/:id - Delete a todo
async function handleTodoDelete(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid todo id format"
      });
    }

    const deletedTodo = await Todo.findByIdAndDelete(id);
    if (!deletedTodo) {
      return res.status(404).json({ message: "Todo not found" });
    }
    
    return res.status(200).json({ message: "Todo deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

export {
  handleTodosGet,
  handleTodoPost,
  handleTodoPut,
  handleTodoDelete
};

