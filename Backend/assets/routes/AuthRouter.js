import express from "express";
import {
  handleLoginPost,
  handleCreatePost,
  handleForgotPassword,
} from "../../controllers/Auth.js";

const AuthRouter = express.Router();

AuthRouter.post("/login", handleLoginPost);

AuthRouter.post("/signup", handleCreatePost);

AuthRouter.post("/forgotPassword", handleForgotPassword);

export default AuthRouter;