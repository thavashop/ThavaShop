var express = require("express");
var router = express.Router();
const cartController = require("./cartController");

router.get("/", cartController.getCart);
router.post("/", cartController.addToCart);
router.delete("/", cartController.removeFromCart);
router.post("/checkout", cartController.checkout);

module.exports = router;
