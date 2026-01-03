import express from "express";
import {
  handleBankAccountsGet,
  handleBankAccountPost,
  handleBankAccountDelete,
  handleMoneyDetailsGet,
  handleMoneyDetailPost,
  handleMoneyDetailPut,
  HandleMoneyDetailDelete
} from "../../controllers/Money.js";

const MoneyRouter = express.Router();

// Bank Account routes
MoneyRouter.get("/money/bank", handleBankAccountsGet);
MoneyRouter.post("/money/bank", handleBankAccountPost);
MoneyRouter.put('/money/bank/delete/:id', handleBankAccountDelete);

// Money Detail (Task) routes
MoneyRouter.get("/money/money", handleMoneyDetailsGet);
MoneyRouter.post("/money/money", handleMoneyDetailPost);
MoneyRouter.put("/money/money/:id", handleMoneyDetailPut);
MoneyRouter.put('/money/money/delete/:id', HandleMoneyDetailDelete);

export default MoneyRouter;

