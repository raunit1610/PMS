import mongoose from "mongoose";

const MoneyDetailSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Account"
    },
    bankAccountId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Bank_Detail"
    },
    amount: {
        type: Number,
        default: 0
    },
    category: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ""
    },
    dueDate: {
        type: String,
        required: true
    },
    priority: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: ""
    },
    title: {
        type: String,
        required: true
    }
});

const Money = mongoose.model("Money_Detail", MoneyDetailSchema);

export default Money;