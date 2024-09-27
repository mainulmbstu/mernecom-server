
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { UserModel } = require("../models/userModel");
const { OrderModel } = require("../models/OrderModel");

const home = async (req, res) => {
  try {
    await res.send("hello mern4");
  } catch (error) {
      res.send(error);
  }
};

const register = async (req, res) => {
  try {
    const { name, email, password, phone, address, answer } = req.body;
    if (!name || !email || !password || !phone || !address || !answer) {
      return res.status(400).send({ msg: "All fields are required" });
    }
    const userExist = await UserModel.findOne({ email });
    if (userExist) {
      return res.status(400).send({ msg: "User already exist" });
    }
    const mobileExist = await UserModel.findOne({ phone });
    if (mobileExist) {
      return res.status(400).send({ msg: "Mobile number already exist" });
    }
    let hashedPass = await bcrypt.hash(password, 10);
      const newUser = await UserModel.create({ name, email, password: hashedPass, phone, address, answer });
      res.status(201).send({ msg: "Registered successfully" });
  } catch (error) {
      console.log(error);
    res.status(500).send({ msg: "error from register", error });
  }
};
//===================================================================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const userExist = await UserModel.findOne({ email });
    if (!userExist) {
      return res.status(400).send({ msg: "User not registered" });
    }
    let passMatch = await bcrypt.compare(password, userExist.password);
    if (!passMatch) {
      return res.status(400).send({ msg: "password not matched" });
    }
      id = userExist._id;
    let token = await jwt.sign({ email, id }, process.env.JWT_KEY, {
      expiresIn: '1d',
    });
      let userInfo= await UserModel.findById(id, {password:0})
    res.status(200).send({ msg: "Login successfully", userInfo, token });
  } catch (error) {
    res.status(500).send({ msg: "error from login", error });
  }
};
//======================================================================
const forgotPasswod = async (req, res) => {
  try {
    const { email, answer, newPassword } = req.body;
    const user = await UserModel.findOne({ email, answer })
    if (!user) {
      return res.status(404).send({msg:'Wrong email or answer'})
    }
    let hashedPass = await bcrypt.hash(newPassword, 10);
    await UserModel.findByIdAndUpdate(user._id, { password: hashedPass })
    res.status(200).send({ msg: "Password reset succesfully" });
  } catch (error) {
    res.status(500).send({ msg: "error from login", error });
  }
};
//===========================================================================
const loggedUser = async (req, res) => {
  try {
    let userData = req.user;
    res.status(200).send({ userData });

  } catch (error) {
    res.status(401).send({ msg: "userControls, user", error });
  }
};
//============================================================
const userUpdate = async (req, res) => {
  try {
    const { id, name, email,password, phone, address } = req.body;
    let user = await UserModel.findById(req.user._id, {password:0, role:0, answer:0});
    if (!user) {
      return res.status(400).send({ msg: "No user found" });
    }
    //  let hashedPass= await bcrypt.hash(password, 10)

    if (id) user._id = id;
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (password) user.password = await bcrypt.hash(password, 10);
    if (address) user.address = address;
    let updatedUser = await user.save();
    res.status(201).send({
      success: true,
      msg: "user updated successfully",
      updatedUser,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ success: false, msg: "error from user update", error });
  }
};


//===========================================================================
const userOrders = async (req, res) => {
 try {
   let page = req.query.page ? req.query.page : 1;
   let size = req.query.size ? req.query.size : 4;
   let skip = (page - 1) * size;
   const total = await OrderModel.find({
     user: req.user._id,
   });
   const orderList = await OrderModel.find({ user: req.user._id })
     .populate("user", { password: 0, answer: 0 })
     .skip(skip)
     .limit(size)
     .sort({ createdAt: -1 });

   if (!orderList || orderList.length === 0) {
     return res.status(400).send({ msg: "No data found" });
   }
   res.status(200).send({ orderList, total:total.length});
 } catch (error) {
   res.status(401).json({ msg: "error from userorders", error });
 }

  // try {
  //   let orders = await OrderModel.find({ user: req.user._id })
  //     .populate({
  //       path: 'products',
  //       populate:({
  //         path: "category",
  //         // model: "Category"
  //         // collection name in model (Category)
  //       })
  //     })
  //   .sort({createdAt:-1})
  //   res.status(200).send({success:true, orders });
  // } catch (error) {
  //   res.status(401).send({success:false, msg: "userControls, userOrders", error });
  // }
};







module.exports = {
  home,
  register,
  login,
  loggedUser,
  forgotPasswod,
  userUpdate,
  userOrders,
};
