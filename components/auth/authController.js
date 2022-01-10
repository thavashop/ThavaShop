const userService = require('./userService')
const mailTransporter = require('../../service/nodemailer')
const passport = require("../../passport");
const cartService = require("../cart/cartService");
const { ObjectId } = require("mongodb");





exports.login = (req, res) => {
    const wrongPassword = req.query['wrong-password'] !== undefined;
    const usernameExist = req.query['username-exist'] !== undefined;
    const passwordConfirmFailed = req.query['password-confirm-failed'] !== undefined;
    res.render('auth/views/login', {
        wrongPassword,
    });
}

exports.logout = (req, res) => {
    req.logout();
    res.redirect('/');
}

exports.register = async (req, res) => {
    const {
        username,
        email,
        password
    } = req.body;

    const passwordConfirm = req.body['password-confirm'];
    if (password == passwordConfirm) {
        const checkExists = await userService.checkExists(username);
        if (checkExists.length != 0) {
            const data = { 'message': 'Username already exists'}
            res.status(200).json(data)
        } else {
            const user = await userService.register(username, email, password);
            const data = {
                'message': 'Success',
                'url': `${process.env.DOMAIN_NAME}/register-success?email=${email}`
            }
            res.status(200).json(data)
        }
    } else {
        const data = { 'message': 'Confirm password does not match'}
        res.status(200).json(data)
    }

}

exports.editAccount = async (req, res) => {
    try {
        req.session.passport.user = await userService.edit(res.locals.user._id, req.body)
        req.flash('success', 'Account editted')
    } catch (err) {
        console.log(err)
        req.flash('error', 'Account edit failed')
    }
    res.redirect('/account')
}

exports.activate = async (req, res) => {
    const {
        username
    } = req.query;
    const activationString = req.query['activation-string'];
    const result = await userService.activate(username, activationString)
    if (result) {
        const user = await userService.findByUsername(username)
        req.login(user, function (err) {
            if (err) return next(err);
            return res.redirect('/')
        })
    } else {
        return res.redirect('/')
    }
}

exports.changePassword = async (req, res) => {
    try {
        const {password0, password1, password2} = req.body
        if (await userService.validPassword(password0, req.user)) {
            if (password1 === password2) {
                req.session.passport.user = await userService.changePassword(req.user._id, password1)
                req.flash('success','Password changed successfully')
            }
            else req.flash('error', 'Incorrect password confirmation')
        }
        else req.flash('error', 'Incorrect old password')
    } catch (error) {
        console.log(error);
    }
    res.redirect('/account')
}

exports.authentication = function (req, res, next) {
    passport.authenticate("local", async function (err, user, info) {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.redirect("/login?wrong-password");
      }
      if (user.status != 'activated') {
        if (user.status == 'banned') {
          res.render('auth/views/banned')
        } else {
          const { email, username } = user;
          res.render('auth/views/activate', { email, username });
        }
      } else {
        req.logIn(user, async function (err) {
          if (err) {
            return next(err);
          }

          const cartCookie = req.cookies?.cart;
          if (cartCookie) {
            //add cart from cookie to db
            console.log(cartCookie);
            //map productId in cookie cart to productId in db
            const cartInCookie = cartCookie.map((item) => {
              return {
                productId: ObjectId(item.productId),
                quantity: item.quantity,
              };
            });
            const cart = await cartService.addOrUpdateCart(user._id, cartInCookie);
            res.cookie("cartLength", cart?.products?.length ?? 0);
            //delete cookie
            res.clearCookie("cart");
          } else {
            const cart = await cartService.getCart(user._id);
            res.cookie("cartLength", cart?.products?.length ?? 0);

          }

          const to = req.cookies.redirectAfterLogin
          res.clearCookie('redirectAfterLogin')
          return res.redirect(to ? to : '/')
          // return res.redirect("/");
        });
      }
    })(req, res, next);
}

exports.resendEmail = async (req, res) => {
    const { username } = req.body
    const user = await userService.findByUsername(username);
    const msg = {
        to: user.email, // Change to your recipient
        from: process.env.EMAIL_SENDER, // Change to your verified sender
        subject: 'ThavaShop account email activation',
        html: `<h1>Thanks for register your account with ThavaShop</h1>
        <p>Please activate your account <a
        href="${process.env.DOMAIN_NAME}/activate?username=${user.username}&activation-string=${user.activationString}"
        >Click here!</a></p>`,
    }
    mailTransporter.sendMail(msg, function(err, data) {
        if(err) {
            console.log(err.message);
        } else {
            console.log('Email sent successfully');
        }
    });
    const email = true
    res.render('auth/views/login', {email})
}

exports.sendMailForgotPassword = async (req, res) => {
    const { username } = req.body
    const user = await userService.findByUsername(username);
    const msg = {
        to: user.email, // Change to your recipient
        from: process.env.EMAIL_SENDER, // Change to your verified sender
        subject: 'ThavaShop account email activation',
        html: `<h1>Thanks for register your account with ThavaShop</h1>
        <p>Please activate your account <a
        href="${process.env.DOMAIN_NAME}/reset-password?username=${user.username}&activation-string=${user.activationString}"
        >Click here!</a></p>`,
    }
    mailTransporter.sendMail(msg, function(err, data) {
        if(err) {
            console.log(err.message);
        } else {
            console.log('Email sent successfully');
        }
    });
    const email = true
    res.render('auth/views/login', {email})
}

exports.resetPassword = async (req, res) => {
    const {
        username
    } = req.query;
    const activationString = req.query['activation-string'];
    const user = await userService.findByUsernameAndAS(username, activationString)
    if (user) {
        req.login(user, function (err) {
            if (err) return next(err);
            const { username } = user;
            return res.render("auth/views/updatePassword", {username})
        })
    } else {
        return res.redirect('/')
    }
}

exports.updatePassword = async (req, res) => {
    const { username, password } = req.body
    const user = await userService.findByUsername(username)
    req.session.passport.user = await userService.changePassword(user._id, password)
    res.redirect('/')
}