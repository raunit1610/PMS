import mongoose from "mongoose";

const AccountSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  dateOfBirth: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  maritalStatus: {
    type: String,
    default: "Single",
  },
  bloodGroup: {
    type: String,
    default: "O+",
  },
  physicallyChallenged: {
    type: String,
    default: "No",
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  phoneSecondary: {
    type: String,
    default: "",
  },
  address1: {
    type: String,
    default: "",
  },
  address2: {
    type: String,
    default: "",
  },
  city: { 
    type: String,
    default: "",
  },
  state: {
    type: String,
    default: "",
  },
  zipCode: {
    type: String,
    default: "",
  },
  country: {
    type: String,
    default: "India",
  },
  profilePhoto: {
    type: String,
    default: "",
  },
});

const account = mongoose.model("Account", AccountSchema);

export default account;