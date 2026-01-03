import express from "express";
import {
  handleDiaryGet,
  handleDiaryEntryGet,
  handleDiaryPost,
  handleDiaryPut,
  handleDiaryDelete
} from "../../controllers/Diary.js";

const DiaryRouter = express.Router();

DiaryRouter.get("/diary", handleDiaryGet);
DiaryRouter.get("/diary/:id", handleDiaryEntryGet);
DiaryRouter.post("/diary", handleDiaryPost);
DiaryRouter.put("/diary/:id", handleDiaryPut);
DiaryRouter.delete("/diary/:id", handleDiaryDelete);

export default DiaryRouter;

