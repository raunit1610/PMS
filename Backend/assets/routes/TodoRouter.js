import express from "express";
import {
  handleTodosGet,
  handleTodoPost,
  handleTodoPut,
  handleTodoDelete,
  handleDeleteAllTodos
} from "../../controllers/Todo.js";

const TodoRouter = express.Router();

TodoRouter.get("/todos", handleTodosGet);
TodoRouter.post("/todos", handleTodoPost);
TodoRouter.put("/todos/:id", handleTodoPut);
TodoRouter.delete("/todos/:id", handleTodoDelete);
TodoRouter.delete("/todos/delete-all", handleDeleteAllTodos);

export default TodoRouter;

