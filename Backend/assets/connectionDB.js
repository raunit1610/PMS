import mongoose from "mongoose";

const ConnectionDB = async (url) => {
  try {
    await mongoose.connect(url);
  } catch (error) {
    console.log("Error while connecting with the database", error);
  }
};

export default ConnectionDB;