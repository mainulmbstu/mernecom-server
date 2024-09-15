const express = require("express");
const loginMiddleware = require("../middleware/loginMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const adminControlls = require("../controllers/adminControlls");

const router = express.Router();

router.get('/user-list', loginMiddleware, adminMiddleware, adminControlls.userList  )
router.get('/order-list', loginMiddleware, adminMiddleware, adminControlls.orderList  )
router.delete('/user/:id', loginMiddleware, adminMiddleware, adminControlls.deleteUser  )
router.post('/user/status/:id', loginMiddleware, adminMiddleware, adminControlls.userStatusUpdate  )
router.post('/order/status/:oid', loginMiddleware, adminMiddleware, adminControlls.orderStatusUpdate  )

// admin authentication (for Private.jsx)
router.get("/adminAuth", loginMiddleware, adminMiddleware, (req, res) => {
  res.status(200).send({ ok: true });
});




module.exports=router