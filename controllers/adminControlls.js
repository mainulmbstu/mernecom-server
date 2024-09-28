const { UserModel } = require("../models/userModel");
const { OrderModel } = require("../models/OrderModel");
const { ProductModel } = require("../models/productModel");
const { GalleryModel } = require("../models/GalleryModel");
const {
  uploadOnCloudinary,
  deleteImageOnCloudinary,
} = require("../helper/cloudinary");

const userList = async (req, res) => {
  try {
    let page = req.query.page ? req.query.page : 1;
    let size = req.query.size ? req.query.size : 4;
    let skip = (page - 1) * size;

    const total = await UserModel.find({}).estimatedDocumentCount();

    const userList = await UserModel.find({}, { password: 0, answer: 0 })
      .skip(skip)
      .limit(size)
      .sort({ updatedAt: -1 });
    if (!userList || userList.length === 0) {
      return res.status(400).send({ msg: "No data found" });
    }
    res.status(200).send({ userList, total });
  } catch (error) {
    res.status(401).json({ msg: "error from user list", error });
  }
};
//===============================================================
const searchUser = async (req, res) => {
  try {
    const { keyword } = req.query;
    let page = req.query?.page ? req.query?.page : 1;
    let size = req.query?.size ? req.query?.size : 4;
    let skip = (page - 1) * size;
    const searchUser = await UserModel.find(
      {
        $or: [
          { email: { $regex: keyword, $options: "i" } },
          { phone: { $regex: keyword, $options: "i" } },
        ],
      },
      { password: 0, answer: 0 }
    )
      .skip(skip)
      .limit(size);
    res.status(200).send({
      msg: "got user from search",
      searchUser,
      total: searchUser.length,
    });
  } catch (error) {
    console.log(error);
    res.status(401).send({ msg: "error from userSearch", error });
  }
};
//======================================================================

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
    let { role } = req.body;
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
    let page = req.query.page ? req.query.page : 1;
    let size = req.query.size ? req.query.size : 4;
    let skip = (page - 1) * size;
    await OrderModel.deleteMany({ "payment.status": false });
    const total = await OrderModel.find({}).estimatedDocumentCount();
    const orderList = await OrderModel.find({})
      .populate("user", { password: 0 })
      .skip(skip)
      .limit(size)
      // .populate("products")
      // .populate({
      //   path: "products",
      //   populate: {
      //     path: "category",
      //   },
      // })
      .sort({ createdAt: -1 });

    if (!orderList || orderList.length === 0) {
      return res.status(400).send({ msg: "No data found" });
    }
    res.status(200).send({ orderList, total, page, size });
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
//=====================================================================
const adminProductList = async (req, res) => {
  try {
    let page = req.query.page ? req.query.page : 1;
    let size = req.query.size ? req.query.size : 4;
    let skip = (page - 1) * size;

    const total = await ProductModel.find({}).estimatedDocumentCount();

    const products = await ProductModel.find({})
      .skip(skip)
      .limit(size)
      .populate("user", { password: 0 })
      .populate("category")
      .sort({ updatedAt: -1 });
    if (!products || products.length === 0) {
      return res.status(400).send({ msg: "No data found" });
    }
    res.status(200).send({ products, total });
  } catch (error) {
    res.status(401).json({ msg: "error from orderList", error });
  }
};

//=============================================

const adminSearchProductList = async (req, res) => {
  try {
    const { keyword } = req.query;
    let page = req.query?.page ? req.query?.page : 1;
    let size = req.query?.size ? req.query?.size : 4;
    let skip = (page - 1) * size;

    const totalSearch = await ProductModel.find(
      {
        $or: [
          { name: { $regex: keyword, $options: "i" } },
          { description: { $regex: keyword, $options: "i" } },
        ],
      },
    )
    const searchProduct = await ProductModel.find(
      {
        $or: [
          { name: { $regex: keyword, $options: "i" } },
          { description: { $regex: keyword, $options: "i" } },
        ],
      },
    )
      .skip(skip)
      .limit(size);
    res.status(200).send({
      msg: "got user from searchProduct",
      searchProduct,
      total: totalSearch.length,
    });
  } catch (error) {
    console.log(error);
    res.status(401).send({ msg: "error from adminSearchProductList", error });
  }
};

//========================================================

const orderSearch = async (req, res) => {
  try {
    const { keyword } = req.query;
    let page = req.query?.page ? req.query?.page : 1;
    let size = req.query?.size ? req.query?.size : 4;
    let skip = (page - 1) * size;
    const searchUser = await UserModel.find(
      {
        $or: [
          { email: { $regex: keyword, $options: "i" } },
          { phone: { $regex: keyword, $options: "i" } },
        ],
      },
      { name: 1, _id: 1, email: 1 }
    );

    const total = await OrderModel.find({
      $or: [
        { status: { $regex: keyword, $options: "i" } },
        { user: searchUser[0]?._id },
      ],
    });
    const searchOrders = await OrderModel.find({
      $or: [
        { status: { $regex: keyword, $options: "i" } },
        { user: searchUser[0]?._id },
      ],
    })
      .skip(skip)
      .limit(size)
      .populate("user", { password: 0, answer: 0 })
      .populate("products")
      .populate({
        path: "products",
        populate: {
          path: "category",
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).send({
      msg: "got orders from search",
      total: total.length,
      searchOrders,
    });
  } catch (error) {
    console.log(error);
    res.status(401).send({ msg: "error from orderSearch", error });
  }
};

//=================================================

const gallery = async (req, res) => {

  try {
    const picturePath = req.files.map(file=>file.path)
    // console.log(picturePath);
    // const { secure_url, public_id } = await uploadOnCloudinary(
    //   picturePath[1],
    //   "gallery"
    // ); // path and folder name as arguments
    // if (!secure_url) {
    //   return res
    //     .status(500)
    //     .send({ msg: "error uploading images", error: secure_url });
    // }

    let imageList = await GalleryModel.find({})

    if (imageList.length === 0) {
      let images = await GalleryModel.create({picture:picturePath} );
      return res
        .status(201)
        .send({ msg: "images uploaded successfully", success: true, images });
    }
    totalImage = [...imageList[0]?.picture, ...picturePath]
    let images = await GalleryModel.findByIdAndUpdate(imageList[0]?._id, {picture:totalImage}, {new:true}  );
    res
      .status(201)
      .send({ msg: "images updated successfully", success: true, images });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({
        msg: "error from gallery create",
        error,
      });
  }
};

module.exports = {
  userList,
  deleteUser,
  userStatusUpdate,
  orderList,
  orderStatusUpdate,
  adminProductList,
  orderSearch,
  searchUser,
  adminSearchProductList,
  gallery,
};
