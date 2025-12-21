import express from "express";
import {
  handleLoginPost,
  handleCreatePost,
  handleForgotPassword,
  handleProfileGet,
  handleProfilePost,
} from "../../controllers/Auth.js";

const AuthRouter = express.Router();

AuthRouter.post("/login", handleLoginPost);

AuthRouter.post("/signup", handleCreatePost);

AuthRouter.post("/forgotPassword", handleForgotPassword);

AuthRouter.get("/profile/:Id", handleProfileGet);

AuthRouter.post("/profile", handleProfilePost)

export default AuthRouter;