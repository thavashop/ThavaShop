var express = require("express");
var router = express.Router();
const authController = require("./authController");
const loggedInUserGuard = require("../../middlewares/loggedInUserGuard");

router.get("/login", authController.login);

router.post("/login", authController.authentication);

router.get("/logout", authController.logout);
router.post("/register", authController.register);
router.get("/register-success", function (req, res) {
  const { email } = req.query
  res.render('auth/views/activate', {email})
});

router.get("/account", loggedInUserGuard, (req, res) => {
  res.render("auth/views/account");
});
router.post("/account", authController.editAccount);
router.post("/account/password", authController.changePassword);

router.get("/activate", authController.activate);
router.post("/resendEmail", authController.resendEmail)

router.get("/forgot-password", (req, res) => {
  res.render("auth/views/forgotPassword");
})
router.post("/forgot-password", authController.sendMailForgotPassword)
router.get("/reset-password", authController.resetPassword)
router.post("/update-password", authController.updatePassword)

module.exports = router;
