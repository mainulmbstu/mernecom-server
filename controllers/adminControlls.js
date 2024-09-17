const { UserModel } = require("../models/userModel");
const { OrderModel } = require("../models/OrderModel");



const userList = async (req, res) => {
  try {
    const userList = await UserModel.find({}, { password: 0 });
    if (!userList || userList.length === 0) {
      return res.status(400).send("No data found");
    }
    res.status(200).send(userList);
  } catch (error) {
    res.status(401).json({ msg: "error from user list", error });
  }
};


let deleteUser = async (req, res) => {
  try {
      let id = req.params.id;
    await UserModel.findByIdAndDelete(id);
    if (!UserModel) {
      return res.status(400).send({ msg: "No data found" });
    }
    res.status(200).send({ msg: "User deleted successfully" });
  } catch (error) {
    res.status(401).send({ msg: "error from delete users", error });
  }
};
//======================================================
let userStatusUpdate = async (req, res) => {
  try {
    let id = req.params.id;
    let {role} = req.body;
    await UserModel.findByIdAndUpdate(id, { role }, { new: true });
    if (!UserModel) {
      return res.status(400).send({ msg: "No data found" });
    }
    res.status(200).send({ msg: "User updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(401).send({ msg: "error from update users", error });
  }
};
//========================================================

const orderList = async (req, res) => {
  try {
    let page = req.query.page?req.query.page:1
    let size = req.query.size ? req.query.size : 5;
    let skip = (page - 1) * size
    console.log(req.query);
     await OrderModel.deleteMany({ 'payment.status': false })
    const total = await OrderModel.find({}).estimatedDocumentCount()
    const orderList = await OrderModel.find({})
    .populate('user', { password: 0 })
    .skip(skip)
    .limit(size)
    .populate('products')
    .populate({
      path: 'products',
      populate:( {
        path:'category'
      })
    })
    .sort({createdAt:-1})
    
    if (!orderList || orderList.length === 0) {
      return res.status(400).send({msg:"No data found"});
    }
    res.status(200).send({orderList, total, page, size});
  } catch (error) {
    res.status(401).json({ msg: "error from orderList", error });
  }
};

//======================================================
let orderStatusUpdate = async (req, res) => {
  try {
    let oid = req.params.oid;
    let { status } = req.body;
    await OrderModel.findByIdAndUpdate(oid, { status }, { new: true });
    if (!OrderModel) {
      return res.status(400).send({ msg: "No data found" });
    }
    res.status(200).send({ msg: "order updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(401).send({ msg: "error from update order", error });
  }
};








module.exports = {
  userList,
  deleteUser,
  userStatusUpdate,
  orderList,
  orderStatusUpdate,
};
