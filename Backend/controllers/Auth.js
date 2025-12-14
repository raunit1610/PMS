import account from "../models/Auth.js";

async function handleLoginPost(req, res) {
  try {
    const data = req.body;
    
    const user = await account.findOne({
      email: data.email,
      password: data.password,
    });
    const userId = user ? user._id : null;
    if (user) {
      res.status(200).json({
        message: "Logged In Successfully",
        uid: userId,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

async function handleCreatePost(req, res) {
  try {
    const createData = req.body;
    const createUser = await account.create(createData);
    if (createUser) {
      res.status(200).json({
        message: "User Created Successfully",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

async function handleForgotPassword(req, res) {
  try {
    const message = req.body;
    const users = await account.find({});
    const user = users.find(
      (user) => user.email === message.data || user.username === message.data
    );
    if (user) {
      res.status(200).json({
        message: "User Found",
        password: user.password,
      });
    } else {
      res.status(404).json({
        message: "User Not Found",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

export { handleLoginPost, handleCreatePost, handleForgotPassword };