import express from "express";
import {
  handleBankAccountsGet,
  handleBankAccountPost,
  handleBankAccountDelete,
  handleMoneyDetailsGet,
  handleMoneyDetailPost,
  handleMoneyDetailPut,
  HandleMoneyDetailDelete,
  handleBankAccountExport,
  handleDeleteAllMoneyTasks,
  handleDebugAccount
} from "../../controllers/Money.js";

const MoneyRouter = express.Router();

// Bank Account routes
MoneyRouter.get("/money/bank", handleBankAccountsGet);
MoneyRouter.post("/money/bank", handleBankAccountPost);
MoneyRouter.put('/money/bank/delete/:id', handleBankAccountDelete);
MoneyRouter.get('/money/bank/:id/export', handleBankAccountExport);
MoneyRouter.get('/money/debug/:accountId', handleDebugAccount);

// Money Detail (Task) routes
MoneyRouter.get("/money/money", handleMoneyDetailsGet);
MoneyRouter.post("/money/money", handleMoneyDetailPost);
MoneyRouter.put("/money/money/:id", handleMoneyDetailPut);
MoneyRouter.put('/money/money/delete/:id', HandleMoneyDetailDelete);
MoneyRouter.delete('/money/money/delete-all', handleDeleteAllMoneyTasks);

export default MoneyRouter;

