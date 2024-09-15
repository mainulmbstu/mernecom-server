const express = require("express");
const loginMiddleware = require("../middleware/loginMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const productControlls = require("../controllers/productControlls");
const upload = require("../middleware/multerMiddleware");

const router = express.Router();

router.post('/create-product', upload.single('picture'), loginMiddleware, adminMiddleware, productControlls.createProduct)

// router.get("/product-list", productControlls.productList);
router.get("/category/:slug", productControlls.productByCategory);
router.post("/product-filter", productControlls.productFilter);

router.get("/more-info/:pid", productControlls.moreInfo);
//=============product count
router.get("/product-count", productControlls.productCount);
//product per page
router.get("/product-list-per-page/:page", productControlls.productListPerPage);
//search
router.get("/search/:keyword", productControlls.productSearch);
//simila products
router.get("/search/similar/:pid/:cid", productControlls.similarProducts);

router.post('/update-product/:pid', upload.single('picture'), loginMiddleware, adminMiddleware, productControlls.updateProduct)

router.delete('/delete-product/:pid', loginMiddleware, adminMiddleware, productControlls.deleteProduct)

// router.patch('/update-category/:id', loginMiddleware, adminMiddleware, categoryControlls.updateCategory)

// ============== checkout ========================================

router.post("/order/checkout", loginMiddleware, productControlls.orderCheckout);
router.post("/payment/success/:trxn_id",productControlls.orderSuccess);
router.post(
  "https://mernecom-server.onrender.com/products/payment/fail/:trxn_id",
  productControlls.orderFail
);












module.exports=router