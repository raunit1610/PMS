import mongoose from "mongoose";

const BankAccountSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Account"
    },
    accountNumber: {
        type: String,
        unique: true,
        required: true
    },
    bankName:{
        type: String,
        default: "Un-Named"
    },
    initialBalance: {
        type: Number,
        default: 0
    },
    name: {
        type: String,
        default: "Un-Named"
    }
});

const BankAccount = mongoose.model("Bank_Detail", BankAccountSchema);

export default BankAccount;