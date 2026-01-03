import express from "express";
import {
  handleTodosGet,
  handleTodoPost,
  handleTodoPut,
  handleTodoDelete
} from "../../controllers/Todo.js";

const TodoRouter = express.Router();

TodoRouter.get("/todos", handleTodosGet);
TodoRouter.post("/todos", handleTodoPost);
TodoRouter.put("/todos/:id", handleTodoPut);
TodoRouter.delete("/todos/:id", handleTodoDelete);

export default TodoRouter;

