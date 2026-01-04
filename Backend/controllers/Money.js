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
    
    // For existing accounts without currentBalance, calculate and set it
    for (const account of bankAccounts) {
      if (account.currentBalance === undefined || account.currentBalance === null) {
        const tasks = await Money.find({ bankAccountId: account._id, userId });
        const completedIncome = tasks
          .filter(t => t.status === 'completed' && t.category === 'income')
          .reduce((sum, task) => sum + (parseFloat(task.amount) || 0), 0);
        const completedExpenses = tasks
          .filter(t => t.status === 'completed' && t.category !== 'income')
          .reduce((sum, task) => sum + (parseFloat(task.amount) || 0), 0);
        
        account.currentBalance = (account.initialBalance || 0) + completedIncome - completedExpenses;
        await account.save();
      }
    }
    
    // Fetch again to get updated accounts
    const updatedAccounts = await BankAccount.find({ userId });
    res.status(200).json(updatedAccounts);
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

    const initialBal = initialBalance || 0;
    const bankAccount = await BankAccount.create({
      userId,
      name: name || "Un-Named",
      accountNumber,
      bankName: bankName || "Un-Named",
      initialBalance: initialBal,
      currentBalance: initialBal // Initialize currentBalance with initialBalance
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

    // If task is created as completed, update currentBalance immediately
    if (status === "completed") {
      const allTasks = await Money.find({ bankAccountId, userId });
      const completedIncome = allTasks
        .filter(t => t.status === 'completed' && t.category === 'income')
        .reduce((sum, task) => sum + (parseFloat(task.amount) || 0), 0);
      const completedExpenses = allTasks
        .filter(t => t.status === 'completed' && t.category !== 'income')
        .reduce((sum, task) => sum + (parseFloat(task.amount) || 0), 0);
      
      const newCurrentBalance = (bankAccount.initialBalance || 0) + completedIncome - completedExpenses;
      bankAccount.currentBalance = newCurrentBalance;
      await bankAccount.save();
    }

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

    // Update the task - ensure status is properly saved
    // Use $set to explicitly set the status field
    const updateFields = {};
    if (updateData.status !== undefined) {
      updateFields.status = updateData.status;
    }
    if (updateData.title !== undefined) {
      updateFields.title = updateData.title;
    }
    if (updateData.description !== undefined) {
      updateFields.description = updateData.description;
    }
    if (updateData.amount !== undefined) {
      updateFields.amount = updateData.amount;
    }
    if (updateData.category !== undefined) {
      updateFields.category = updateData.category;
    }
    if (updateData.dueDate !== undefined) {
      updateFields.dueDate = updateData.dueDate;
    }
    if (updateData.priority !== undefined) {
      updateFields.priority = updateData.priority;
    }
    if (updateData.bankAccountId !== undefined) {
      updateFields.bankAccountId = updateData.bankAccountId;
    }

    // Log the update for debugging
    // if (updateData.status !== undefined) {
    //   console.log(`Updating task ${id} status from ${moneyDetail.status} to ${updateData.status}`);
    // }

    const updatedMoneyDetail = await Money.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).populate('bankAccountId', 'name bankName accountNumber');

    // Verify the update was successful
    if (!updatedMoneyDetail) {
      return res.status(404).json({
        message: "Money detail not found after update"
      });
    }

    // Double-check the status was saved correctly
    if (updateData.status !== undefined) {
      const verifyTask = await Money.findById(id);
      if (!verifyTask) {
        return res.status(404).json({
          message: "Task not found for verification"
        });
      }
      if (verifyTask.status !== updateData.status) {
        console.error(`Status update failed: Expected ${updateData.status}, got ${verifyTask.status}`);
        // Try to update again with explicit save
        verifyTask.status = updateData.status;
        await verifyTask.save();
        const reVerify = await Money.findById(id);
        if (reVerify.status !== updateData.status) {
          return res.status(500).json({
            message: `Status update failed to persist. Expected ${updateData.status}, got ${reVerify.status}`
          });
        }
      }
      // console.log(`Status update verified: Task ${id} now has status ${verifyTask.status}`);
      
      // Update currentBalance in database immediately when status changes
      const bankAccountId = updatedMoneyDetail.bankAccountId._id || updatedMoneyDetail.bankAccountId;
      const bankAccount = await BankAccount.findById(bankAccountId);
      if (bankAccount) {
        // Get all tasks for this account
        const allTasks = await Money.find({ 
          bankAccountId: bankAccountId, 
          userId: updatedMoneyDetail.userId 
        });
        
        // Calculate current balance: initialBalance + completedIncome - completedExpenses
        const completedIncome = allTasks
          .filter(t => t.status === 'completed' && t.category === 'income')
          .reduce((sum, task) => sum + (parseFloat(task.amount) || 0), 0);
        
        const completedExpenses = allTasks
          .filter(t => t.status === 'completed' && t.category !== 'income')
          .reduce((sum, task) => sum + (parseFloat(task.amount) || 0), 0);
        
        const newCurrentBalance = (bankAccount.initialBalance || 0) + completedIncome - completedExpenses;
        
        // Update currentBalance in database
        bankAccount.currentBalance = newCurrentBalance;
        await bankAccount.save();
        
        // console.log(`Updated currentBalance for account ${bankAccountId}: ${newCurrentBalance}`);
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

    const deleteMoney = await Money.findById(id);
    if (!deleteMoney) {
      return res.status(404).json({ message: "Money Task not found" });
    }

    const bankAccountId = deleteMoney.bankAccountId;
    const userId = deleteMoney.userId;

    await Money.findByIdAndDelete(id);

    // Update currentBalance after deletion
    // const bankAccount = await BankAccount.findById(bankAccountId);
    // if (bankAccount) {
    //   const allTasks = await Money.find({ bankAccountId, userId });
    //   const completedIncome = allTasks
    //     .filter(t => t.status === 'completed' && t.category === 'income')
    //     .reduce((sum, task) => sum + (parseFloat(task.amount) || 0), 0);
    //   const completedExpenses = allTasks
    //     .filter(t => t.status === 'completed' && t.category !== 'income')
    //     .reduce((sum, task) => sum + (parseFloat(task.amount) || 0), 0);
      
    //   const newCurrentBalance = (bankAccount.initialBalance || 0) + completedIncome - completedExpenses;
    //   bankAccount.currentBalance = newCurrentBalance;
    //   await bankAccount.save();
    // }

    return res.status(200).json({ message: "Money Task deleted successfully" });
  }catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

// GET /feature/money/bank/:id/export - Export bank account tasks and details as CSV
async function handleBankAccountExport(req, res) {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        message: "userId is required"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        message: "Invalid id format"
      });
    }

    // Get bank account
    const bankAccount = await BankAccount.findOne({ _id: id, userId });
    if (!bankAccount) {
      return res.status(404).json({
        message: "Bank account not found"
      });
    }

    // Get all tasks for this bank account
    const tasks = await Money.find({ bankAccountId: id, userId }).sort({ createdAt: -1 });

    // Generate CSV content
    let csvContent = 'Bank Account Details\n';
    csvContent += 'Account Name,' + (bankAccount.name || '') + '\n';
    csvContent += 'Bank Name,' + (bankAccount.bankName || '') + '\n';
    csvContent += 'Account Number,' + (bankAccount.accountNumber || '') + '\n';
    csvContent += 'Initial Balance,' + (bankAccount.initialBalance || 0) + '\n';
    csvContent += '\n';
    csvContent += 'Tasks\n';
    csvContent += 'Title,Description,Amount,Category,Status,Priority,Due Date,Created At\n';
    
    tasks.forEach(task => {
      const title = (task.title || '').replace(/,/g, ';');
      const description = (task.description || '').replace(/,/g, ';').replace(/\n/g, ' ');
      const amount = task.amount || 0;
      const category = task.category || '';
      const status = task.status || '';
      const priority = task.priority || '';
      const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '';
      const createdAt = task.createdAt ? new Date(task.createdAt).toLocaleDateString() : '';
      
      csvContent += `"${title}","${description}",${amount},${category},${status},${priority},${dueDate},${createdAt}\n`;
    });

    // Set headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="bank_account_${bankAccount.name || 'export'}_${Date.now()}.csv"`);
    res.status(200).send(csvContent);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

// DELETE /feature/money/money/delete-all - Delete all money tasks for a user
async function handleDeleteAllMoneyTasks(req, res) {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        message: "userId is required"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        message: "Invalid userId format"
      });
    }

    // Get all bank accounts for this user before deleting tasks
    // const bankAccounts = await BankAccount.find({ userId });
    
    const result = await Money.deleteMany({ userId });
    
    // Reset currentBalance to initialBalance for all accounts since all tasks are deleted
    // for (const account of bankAccounts) {
    //   account.currentBalance = account.initialBalance || 0;
    //   await account.save();
    // }
    
    res.status(200).json({
      message: "All money tasks deleted successfully",
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

// GET /feature/money/debug/:accountId - Debug endpoint to check database state
async function handleDebugAccount(req, res) {
  try {
    const { accountId } = req.params;
    const { userId } = req.query;

    if (!userId || !accountId) {
      return res.status(400).json({
        message: "userId and accountId are required"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(accountId)) {
      return res.status(400).json({
        message: "Invalid id format"
      });
    }

    const bankAccount = await BankAccount.findOne({ _id: accountId, userId });
    if (!bankAccount) {
      return res.status(404).json({
        message: "Bank account not found"
      });
    }

    const tasks = await Money.find({ bankAccountId: accountId, userId });
    
    const completedIncome = tasks
      .filter(t => t.status === 'completed' && t.category === 'income')
      .reduce((sum, task) => sum + (task.amount || 0), 0);
    
    const completedExpenses = tasks
      .filter(t => t.status === 'completed' && t.category !== 'income')
      .reduce((sum, task) => sum + (task.amount || 0), 0);

    const calculatedBalance = (bankAccount.initialBalance || 0) + completedIncome - completedExpenses;

    res.status(200).json({
      bankAccount: {
        _id: bankAccount._id,
        name: bankAccount.name,
        initialBalance: bankAccount.initialBalance,
        currentBalance: bankAccount.currentBalance
      },
      tasks: tasks.map(t => ({
        _id: t._id,
        title: t.title,
        amount: t.amount,
        category: t.category,
        status: t.status
      })),
      calculation: {
        initialBalance: bankAccount.initialBalance,
        currentBalanceInDB: bankAccount.currentBalance,
        completedIncome,
        completedExpenses,
        calculatedBalance
      }
    });
  } catch (error) {
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
  HandleMoneyDetailDelete,
  handleBankAccountExport,
  handleDeleteAllMoneyTasks,
  handleDebugAccount
};

