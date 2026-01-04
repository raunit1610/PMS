import express from "express";
import {
  handleTasksGet,
  handleTaskPost,
  handleTaskPut,
  handleTaskDelete,
  handleDeleteAllTasks
} from "../../controllers/Task.js";

const TaskRouter = express.Router();

TaskRouter.get("/tasks", handleTasksGet);
TaskRouter.post("/tasks", handleTaskPost);
TaskRouter.put("/tasks/:id", handleTaskPut);
TaskRouter.delete("/tasks/:id", handleTaskDelete);
TaskRouter.delete("/tasks/delete-all", handleDeleteAllTasks);

export default TaskRouter;

