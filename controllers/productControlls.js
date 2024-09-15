const {
  uploadOnCloudinary,
  deleteImageOnCloudinary,
} = require("../helper/cloudinary");
const { v4: uuidv4 } = require("uuid");

const SSLCommerzPayment = require("sslcommerz-lts");

const { ProductModel } = require("../models/productModel");
const { CategoryModel } = require("../models/CategoryModel");
const slugify = require("slugify");
const { OrderModel } = require("../models/OrderModel");

const createProduct = async (req, res) => {
  try {
    const { name, description, category, price, quantity, shipping } = req.body;
    // const picture = req.file?.fieldname;
    const picturePath = req.file?.path;
    if (!name || !description || !category || !price || !quantity) {
      return res.status(400).send({ msg: "All fields are required" });
    }

    const { secure_url, public_id } = await uploadOnCloudinary(
      picturePath,
      "products"
    ); // path and folder name as arguments
    if (!secure_url) {
      return res
        .status(500)
        .send({ msg: "error uploading image", error: secure_url });
    }

    let product = await ProductModel.create({
      name,
      slug: slugify(name),
      description,
      category,
      price,
      quantity,
      user: req.user?._id,
      picture: { secure_url, public_id },
      shipping,
    });
    res
      .status(201)
      .send({ msg: "product created successfully", success: true, product });
  } catch (error) {
    console.log(error);
    res.status(500).send({ msg: "error from product create", error });
  }
};
//=========================================
const productList = async (req, res) => {
  try {
    const products = await ProductModel.find({})
      // .select({ picture: 0 })
      .populate("category")
      .populate("user", { password: 0 })
      // .limit(2)
      .sort({ updatedAt: -1 });

    if (!products || products.length === 0) {
      return res.status(400).send("No data found");
    }
    res.status(200).send(products);
  } catch (error) {
    console.log(error);
    res.status(401).send({ msg: "error from product List", error });
  }
};
//=========================================
const productByCategory = async (req, res) => {
  try {
    const category = await CategoryModel.findOne({ slug: req.params.slug });
    const products = await ProductModel.find({ category })
      // .select({ picture: 0 })
      .populate("category")
      // .limit(2)
      .sort();

    if (!products || products.length === 0) {
      return res.status(400).send({ msg: "No data found" });
    }
    res.status(200).send({ products });
  } catch (error) {
    console.log(error);
    res.status(401).send({ msg: "error from productByCategory", error });
  }
};
//================================================
const moreInfo = async (req, res) => {
  try {
    const { pid } = req.params;
    const products = await ProductModel.find({ _id: pid }).populate("category");

    res.status(200).send({ msg: "got product from search", products });
  } catch (error) {
    console.log(error);
    res.status(401).send({ msg: "error from product List", error });
  }
};
//=========================================
const productCount = async (req, res) => {
  try {
    const total = await ProductModel.find({}).estimatedDocumentCount();
    res.status(200).send({ msg: "got total count", total });
  } catch (error) {
    console.log(error);
    res.status(401).send({ msg: "error from product count", error });
  }
};
//=========================================
const productListPerPage = async (req, res) => {
  try {
    const perPage = 4;
    const page = req.params.page ? req.params.page : 1;
    const products = await ProductModel.find({})
      .skip((page - 1) * perPage)
      .populate("category")
      .populate("user", { password: 0 })
      .limit(perPage)
      .sort({ updatedAt: -1 });
    res.status(200).send({ msg: "got product per page", products });
  } catch (error) {
    console.log(error);
    res.status(401).send({ msg: "error from productListPerPage", error });
  }
};
//==========================================
const productSearch = async (req, res) => {
  try {
    const { keyword } = req.params;
    const products = await ProductModel.find({
      $or: [
        { name: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ],
    })
      .populate("category")
      .limit(6)
      .sort({ updatedAt: -1 });
    res.status(200).send({ msg: "got product from search", products });
  } catch (error) {
    console.log(error);
    res.status(401).send({ msg: "error from productSearch", error });
  }
};
//=================================================================
const similarProducts = async (req, res) => {
  try {
    const { pid, cid } = req.params;
    const products = await ProductModel.find({
      category: cid,
      _id: { $ne: pid },
    })
      .populate("category")
      .limit(6)
      .sort({ updatedAt: -1 });
    res.status(200).send({ msg: "got product from search", products });
  } catch (error) {
    console.log(error);
    res.status(401).send({ msg: "error from productSearch", error });
  }
};
//============================================
const productFilter = async (req, res) => {
  try {
    const { checkedCat, priceCat } = req.body;
    let args = {};
    if (checkedCat.length > 0) args.category = checkedCat;
    if (priceCat.length > 0)
      args.price = { $gte: priceCat[0], $lte: priceCat[1] };
    const products = await ProductModel.find(args)
      // .select({ picture: 0 })
      .populate("category")
      .populate("user", { password: 0 })
      // .limit(2)
      .sort({ updatedAt: -1 });

    // if (!products || products.length === 0) {
    //   return res.status(403).json({success:false, msg:"No data found in this category", products});
    // }
    res.status(200).send({ success: true, products });
  } catch (error) {
    console.log(error);
    res
      .status(401)
      .send({ success: false, msg: "error from product List", error });
  }
};
//===========================================
const singleProduct = async (req, res) => {
  try {
    const singleProduct = await ProductModel.findOne({ _id: req.params.pid })
      .populate("category")
      .populate("user", { password: 0 });

    if (!singleProduct) {
      return res.status(400).send("No data found");
    }
    res.status(200).send(singleProduct);
  } catch (error) {
    res.status(401).json({ msg: "error from singleProduct", error });
  }
};
//======================================

const updateProduct = async (req, res) => {
  try {
    let pid = req.params.pid;
    const { name, description, category, price, quantity, shipping } = req.body;
    // const picture = req.file?.fieldname;
    const picturePath = req.file?.path;
    let product = await ProductModel.findById(pid);
    if (!product) {
      return res.status(400).send({ msg: "No data found" });
    }

    if (name) product.name = name;
    if (name) product.slug = slugify(name);
    if (description) product.description = description;
    if (category) product.category = category;
    if (price) product.price = price;
    if (quantity) product.quantity = quantity;
    if (shipping) product.shipping = shipping;

    // upload and delete image on cloudinary
    if (picturePath) {
      let { secure_url, public_id } = await uploadOnCloudinary(
        picturePath,
        "products"
      );
      if (product.picture && product.picture.public_id) {
        await deleteImageOnCloudinary(product.picture.public_id);
      }

      product.picture = { secure_url, public_id };
    }

    let updatedProduct = await product.save();
    res.status(201).send({
      success: true,
      msg: "product updated successfully",
      updatedProduct,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ success: false, msg: "error from product update", error });
  }
};

let deleteProduct = async (req, res) => {
  try {
    let pid = req.params.pid;
    let deleteItem = await ProductModel.findById(pid);
    if (!deleteItem) {
      return res.status(400).send({ msg: "No data found" });
    }
    if (deleteItem.picture && deleteItem.picture.public_id) {
      await deleteImageOnCloudinary(deleteItem.picture.public_id);
    }
    await ProductModel.findByIdAndDelete(pid);
    res.status(200).send({ msg: "Product deleted successfully" });
  } catch (error) {
    res.status(401).send({ msg: "error from delete Category", error });
  }
};

//============checkout ==========================

const orderCheckout = async (req, res) => {
  try {
    const { cart } = req?.body;
    let total = 0;
    cart.map((item) => (total += item?.price));
    let trxn_id = "DEMO" + uuidv4();
    let baseUrl = "http://localhost:8000"; // has been changed after deployment
    
    const data = {
      total_amount: total,
      currency: "BDT",
      tran_id: trxn_id, // use unique tran_id for each api call
      success_url: `http://localhost:8000/products/payment/success/${trxn_id}`,
      fail_url: `http://localhost:8000/products/payment/fail/${trxn_id}`,
      cancel_url: `http://localhost:8000/products/payment/fail/${trxn_id}`,
      ipn_url: "http://localhost:3030/ipn",
      shipping_method: "Courier",
      product_name: "Multi",
      product_category: "Multi",
      product_profile: "general",
      cus_name: req?.user?.name,
      cus_email: req?.user?.email,
      cus_add1: req?.user?.address,
      cus_add2: "Dhaka",
      cus_city: "Dhaka",
      cus_state: "Dhaka",
      cus_postcode: "1000",
      cus_country: "Bangladesh",
      cus_phone: req?.user?.phone,
      cus_fax: "01711111111",
      ship_name: "Customer Name",
      ship_add1: "Dhaka",
      ship_add2: "Dhaka",
      ship_city: "Dhaka",
      ship_state: "Dhaka",
      ship_postcode: 1000,
      ship_country: "Bangladesh",
    };

    // sslcommerz
    const store_id = process.env.STORE_ID;
    const store_passwd = process.env.STORE_PASS;
    const is_live = false; //true for live, false for sandbox

    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
    sslcz.init(data).then((apiResponse) => {
      // Redirect the user to payment gateway
      let GatewayPageURL = apiResponse.GatewayPageURL;
      res.send({ url: GatewayPageURL });
      // console.log("Redirecting to: ", GatewayPageURL);

      let order = {
        products: cart,
        total,
        payment: {
          trxn_id,
        },
        user: req.user._id,
      };
      OrderModel.create(order);
    });

    // res.status(200).send({ success: true, order });
  } catch (error) {
    console.log(error);
    res
      .status(401)
      .send({ success: false, msg: "error from product order", error });
  }
};
//=============================================================

const orderSuccess = async (req, res) => {
  try {
    let trxn_id = req.params.trxn_id;

    let updated = await OrderModel.findOneAndUpdate(
      { "payment.trxn_id": trxn_id },
      { "payment.status": true },
      { new: true }
    );

    if (updated.isModified) {
      res.redirect(
        `${process.env.FRONT_URL}/products/payment/success/${updated._id}`
      );
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ success: false, msg: "error from orderSuccess", error });
  }
};
//============================================================
const orderFail = async (req, res) => {
  try {
    let trxn_id = req.params.trxn_id;
    let deleted = await OrderModel.findOneAndDelete({
      "payment.trxn_id": trxn_id,
    });
    if (deleted.$isDeleted) {
      res.redirect(`${process.env.FRONT_URL}/products/payment/fail`);
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ success: false, msg: "error from orderSuccess", error });
  }
};

module.exports = {
  createProduct,
  productList,
  singleProduct,
  updateProduct,
  deleteProduct,
  productFilter,
  productCount,
  productListPerPage,
  productSearch,
  similarProducts,
  moreInfo,
  productByCategory,
  orderCheckout,
  orderSuccess,
  orderFail,
};
