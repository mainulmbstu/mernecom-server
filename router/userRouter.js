const express = require("express");
const userControlls = require("../controllers/userControlls");
const loginMiddleware = require("../middleware/loginMiddleware");


const router = express.Router();

router.get("/", userControlls.home);
router.post("/register", userControlls.register);
router.post("/login", userControlls.login);
router.patch("/forgotpassword", userControlls.forgotPasswod);
router.get("/user", loginMiddleware, userControlls.loggedUser);
router.post("/user/update", loginMiddleware, userControlls.userUpdate);
router.get("/user/orders", loginMiddleware, userControlls.userOrders);

// user authentication (for Private.jsx)
router.get("/userAuth", loginMiddleware, (req, res) => {
    res.status(200).send({ok:true})
});



module.exports = router;



