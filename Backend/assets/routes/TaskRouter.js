import express from "express";
import {
  handleTasksGet,
  handleTaskPost,
  handleTaskPut,
  handleTaskDelete
} from "../../controllers/Task.js";

const TaskRouter = express.Router();

TaskRouter.get("/tasks", handleTasksGet);
TaskRouter.post("/tasks", handleTaskPost);
TaskRouter.put("/tasks/:id", handleTaskPut);
TaskRouter.delete("/tasks/:id", handleTaskDelete);

export default TaskRouter;

