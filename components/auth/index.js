var express = require('express');
var router = express.Router();
const authController = require('./authController')
const loggedInUserGuard = require('../../middlewares/loggedInUserGuard')
const passport = require('../../passport')


router.get('/login', authController.login);
router.post('/login', passport.authenticate('local', {
    failureRedirect: '/login?wrong-password'
}), (req, res) => {
    if (req.user) {
        const to = req.cookies.redirectAfterLogin
        res.clearCookie('redirectAfterLogin')
        res.redirect(to ? to : '/')
    }
});


router.get('/logout', authController.logout);
router.post('/register', authController.register);


router.get('/account', loggedInUserGuard, (req, res) => {
    res.render('auth/views/account')
});
router.post('/account', authController.editAccount)
router.post('/account/password', authController.changePassword)

router.get('/activate', authController.activate)

module.exports = router;