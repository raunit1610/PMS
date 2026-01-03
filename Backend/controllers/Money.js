import BankAccount from "../models/BankAccount.js";
import Money from "../models/MoneyDetail.js";
import mongoose from "mongoose";

// GET /feature/money/bank - Get all bank accounts for a user
async function handleBankAccountsGet(req, res) {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({
        message: "userId is required"
      });
    }

    // Validate userId format (MongoDB ObjectId)
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        message: "Invalid userId format"
      });
    }

    const bankAccounts = await BankAccount.find({ userId });
    
    res.status(200).json(bankAccounts);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

// POST /feature/money/bank - Create a new bank account
async function handleBankAccountPost(req, res) {
  try {
    const { userId, name, accountNumber, bankName, initialBalance } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: "userId is required"
      });
    }

    // Validate userId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        message: "Invalid userId format"
      });
    }

    // Check if account number already exists
    const existingAccount = await BankAccount.findOne({ accountNumber });
    if (existingAccount) {
      return res.status(400).json({
        message: "Account number already exists"
      });
    }

    const bankAccount = await BankAccount.create({
      userId,
      name: name || "Un-Named",
      accountNumber,
      bankName: bankName || "Un-Named",
      initialBalance: initialBalance || 0
    });

    res.status(201).json(bankAccount);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

// PUT /feature/money/bank/delete - Delete Bank Account
async function handleBankAccountDelete(req, res){
  try{
    const { id } = req.params;
    const msg = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid bank id format"
      });
    }

    // Delete all Money (Task) documents associated with the bank account
    await Money.deleteMany({ bankAccountId: id });

    // Delete the actual bank account
    const deletedAccount = await BankAccount.findOneAndDelete({_id: id});
    if (!deletedAccount) {
      return res.status(404).json({ message: "Bank account not found" });
    }
    return res.status(200).json({ message: "Bank account deleted successfully" });
  }catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

// GET /feature/money/money - Get all money details (tasks) for a user
async function handleMoneyDetailsGet(req, res) {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({
        message: "userId is required"
      });
    }

    // Validate userId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        message: "Invalid userId format"
      });
    }

    const moneyDetails = await Money.find({ userId }).populate('bankAccountId', 'name bankName accountNumber');
    
    res.status(200).json(moneyDetails);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

// POST /feature/money/money - Create a new money detail (task)
async function handleMoneyDetailPost(req, res) {
  try {
    const { userId, bankAccountId, title, description, amount, category, dueDate, priority, status } = req.body;

    if (!userId || !bankAccountId || !title || !category || !dueDate || !priority) {
      return res.status(400).json({
        message: "userId, bankAccountId, title, category, dueDate, and priority are required"
      });
    }

    // Validate userId and bankAccountId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        message: "Invalid userId format"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(bankAccountId)) {
      return res.status(400).json({
        message: "Invalid bankAccountId format"
      });
    }

    // Verify bank account exists and belongs to user
    const bankAccount = await BankAccount.findOne({ _id: bankAccountId, userId });
    if (!bankAccount) {
      return res.status(404).json({
        message: "Bank account not found or does not belong to user"
      });
    }

    const moneyDetail = await Money.create({
      userId,
      bankAccountId,
      title,
      description: description || "",
      amount: amount || 0,
      category,
      dueDate,
      priority,
      status: status || "pending"
    });

    // Populate the bankAccountId field before returning
    await moneyDetail.populate('bankAccountId', 'name bankName accountNumber');

    res.status(201).json(moneyDetail);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

// PUT /feature/money/money/:id - Update a money detail (task)
async function handleMoneyDetailPut(req, res) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid task id format"
      });
    }

    // Find the task
    const moneyDetail = await Money.findById(id);
    if (!moneyDetail) {
      return res.status(404).json({
        message: "Money detail not found"
      });
    }

    // If updating bankAccountId, verify it exists and belongs to user
    if (updateData.bankAccountId) {
      if (!mongoose.Types.ObjectId.isValid(updateData.bankAccountId)) {
        return res.status(400).json({
          message: "Invalid bankAccountId format"
        });
      }

      const bankAccount = await BankAccount.findOne({ 
        _id: updateData.bankAccountId, 
        userId: moneyDetail.userId 
      });
      if (!bankAccount) {
        return res.status(404).json({
          message: "Bank account not found or does not belong to user"
        });
      }
    }

    // Update the task
    const updatedMoneyDetail = await Money.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('bankAccountId', 'name bankName accountNumber');

    const taskCategory = updatedMoneyDetail.category;
    const taskAmount = updatedMoneyDetail.amount;
    const taskStatus = updatedMoneyDetail.status;

    const bankAccount = await BankAccount.findOne({ 
      _id: updatedMoneyDetail.bankAccountId._id, 
      userId: updatedMoneyDetail.userId 
    });

    // Corrected logic for updating the bank account balance
    if (typeof taskAmount === 'number' && bankAccount) {
      let newBalance = bankAccount.initialBalance;

      if (taskCategory === 'income') {
        if (taskStatus === 'completed' && moneyDetail.status !== 'completed') {
          // Income completed: add to balance if not already completed
          newBalance += taskAmount;
        } else if (taskStatus === 'pending' && moneyDetail.status === 'completed') {
          // Income reverted to pending: subtract from balance
          newBalance -= taskAmount;
        }
      } else{
        if (taskStatus === 'completed' && moneyDetail.status !== 'completed') {
          // Expense completed: subtract from balance if not already completed
          newBalance -= taskAmount;
        } else if (taskStatus === 'pending' && moneyDetail.status === 'completed') {
          // Expense reverted to pending: add back to balance
          newBalance += taskAmount;
        }
      }

      // Only save if balance changed
      if (newBalance !== bankAccount.initialBalance) {
        bankAccount.initialBalance = newBalance;
        await bankAccount.save();
      }
    }

    res.status(200).json(updatedMoneyDetail);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

// PUT /feature/money/money/delete - Delete Bank Account
async function HandleMoneyDetailDelete(req, res){
  try{
    const { id } = req.params;
    const msg = req.body;

    // Convert id from string to mongoose ObjectId type
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid task id format"
      });
    }

    const deleteMoney = await Money.findByIdAndDelete(id);
    if (!deleteMoney) {
      return res.status(404).json({ message: "Money Task not found" });
    }
    return res.status(200).json({ message: "Money Task deleted successfully" });
  }catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

export {
  handleBankAccountsGet,
  handleBankAccountPost,
  handleBankAccountDelete,
  handleMoneyDetailsGet,
  handleMoneyDetailPost,
  handleMoneyDetailPut,
  HandleMoneyDetailDelete
};

