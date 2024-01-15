const { hashpassword, comparepassword } = require("../helpers/authHelper");
const orderModel = require("../models/orderModel");
const usermodel = require("../models/usermodel");
const JWT = require("jsonwebtoken");

const registerController = async (req, res) => {
  try {
    const { name, email, password, address, phone, answer } = req.body;
    if (!name) {
      res.send("Name is required");
    }
    if (!email) {
      res.send("email is required");
    }
    if (!password) {
      res.send("password is required");
    }
    if (!address) {
      res.send("address is required");
    }
    if (!phone) {
      res.send("phone is required");
    }
    if (!answer) {
      res.send("answer is required");
    }
    const existingUser = await usermodel.findOne({ email });
    if (existingUser) {
      return res.status.send(200)({
        success: false,
        message: "user already exist with this email",
      });
    }
    const hashedPassword = await hashpassword(password);
    const user = await new usermodel({
      name,
      email,
      password: hashedPassword,
      address,
      phone,
      answer,
    }).save();
    res.status(201).send({
      success: true,
      message: "user created successfully",
      user,
    });
  } catch (err) {
    res.status(404).send({
      message: "error in registration controller",
      success: false,
    });
  }
};

const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      res.send("email is required");
    }
    if (!password) {
      res.send("password is required");
    }

    const user = await usermodel.findOne({ email });
    if (!user) {
      return res.status.send(200)({
        success: false,
        message: "user does not exist with this email",
      });
    }
    const comparedpassword = await comparepassword(password, user.password);
    const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRETKEY);
    if (comparedpassword) {
      res.status(201).send({
        success: true,
        message: "user loggedIn",
        user: {
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address,
          role: user.role,
          answer: user.answer,
        },
        token,
      });
    } else {
      res.send("user does not exist");
    }
  } catch (err) {
    res.status(404).send({
      message: "error in login controller",
      success: false,
    });
  }
};

const forgetPassword = async (req, res) => {
  try {
    const { email, answer, newPassword } = req.body;

    if (!email) {
      res.send("email is required");
    }
    if (!answer) {
      res.send("email is required");
    }
    if (!newPassword) {
      res.send("password is required");
    }

    const user = await usermodel.findOne({ email, answer });
    if (!user) {
      return res.status.send(200)({
        success: false,
        message: "user does not exist with this email",
      });
    }
    const hashedPassword = await hashpassword(newPassword);
    await usermodel.findByIdAndUpdate(user._id, { password: hashedPassword });
    res.status(201).send({
      success: true,
      message: "Password Reset successfully",
    });
  } catch (err) {
    res.status(404).send({
      message: "error in login controller",
      success: false,
    });
  }
};

//orders
const getOrdersController = async (req, res) => {
  try {
    const orders = await orderModel
      .find({ buyer: req.user._id })
      .populate("products", "-photo")
      .populate("buyer", "name");
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error WHile Geting Orders",
      error,
    });
  }
};

//orders
const getAllOrdersController = async (req, res) => {
  try {
    const orders = await orderModel
      .find({})
      .populate("products", "-photo")
      .populate("buyer", "name")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error While Geting Orders",
      error,
    });
  }
};

//order status
const orderStatusController = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const orders = await orderModel.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error While Updateing Order",
      error,
    });
  }
};

//update profile
const updateProfileController = async (req, res) => {
  try {
    const { name, email, password, address, phone } = req.body;
    const user = await usermodel.findById(req.user._id);
    //password
    if (password && password.length < 6) {
      return res.json({ error: "Passsword is required and 6 character long" });
    }
    const hashedPassword = password ? await hashpassword(password) : undefined;
    const updatedUser = await usermodel.findByIdAndUpdate(
      req.user._id,
      {
        name: name || user.name,
        password: hashedPassword || user.password,
        phone: phone || user.phone,
        address: address || user.address,
      },
      { new: true }
    );
    res.status(200).send({
      success: true,
      message: "Profile Updated SUccessfully",
      updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error WHile Update profile",
      error,
    });
  }
};

module.exports.registerController = registerController;
module.exports.loginController = loginController;
module.exports.forgetPassword = forgetPassword;
module.exports.getOrdersController = getOrdersController;
module.exports.getAllOrdersController = getAllOrdersController;
module.exports.orderStatusController = orderStatusController;
module.exports.updateProfileController = updateProfileController;
