const express = require("express");
const loginMiddleware = require("../middleware/loginMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const productControlls = require("../controllers/productControlls");
const upload = require("../middleware/multerMiddleware");

const router = express.Router();

router.post('/create-product', loginMiddleware, adminMiddleware, upload.array('picture', 10), productControlls.createProduct)
// router.post('/create-product', loginMiddleware, adminMiddleware, upload.single('picture'), productControlls.createProduct)

// router.get("/product-list", productControlls.productList);
router.get("/category/:slug", productControlls.productByCategory);
router.post("/product-filter", productControlls.productFilter);

router.get("/more-info/:pid", productControlls.moreInfo);
//=============product list

router.get("/product-list-limit", productControlls.productListLimit);
//search
router.get("/search", productControlls.productSearch);
//simila products
router.get("/search/similar/:pid/:cid", productControlls.similarProducts);

router.post('/update-product/:pid', upload.single('picture'), loginMiddleware, adminMiddleware, productControlls.updateProduct)

router.delete('/delete-product/:pid', loginMiddleware, adminMiddleware, productControlls.deleteProduct)


// ============== checkout ========================================

router.post("/order/checkout", loginMiddleware, productControlls.orderCheckout);
router.post("/payment/success/:trxn_id",productControlls.orderSuccess);
router.post("/payment/fail/:trxn_id", productControlls.orderFail);












module.exports=router