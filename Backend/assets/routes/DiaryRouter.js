import express from "express";
import {
  handleDiaryGet,
  handleDiaryEntryGet,
  handleDiaryPost,
  handleDiaryPut,
  handleDiaryDelete,
  handleDeleteAllDiaryEntries
} from "../../controllers/Diary.js";

const DiaryRouter = express.Router();

DiaryRouter.get("/diary", handleDiaryGet);
DiaryRouter.get("/diary/:id", handleDiaryEntryGet);
DiaryRouter.post("/diary", handleDiaryPost);
DiaryRouter.put("/diary/:id", handleDiaryPut);
DiaryRouter.delete("/diary/:id", handleDiaryDelete);
DiaryRouter.delete("/diary/delete-all", handleDeleteAllDiaryEntries);

export default DiaryRouter;

