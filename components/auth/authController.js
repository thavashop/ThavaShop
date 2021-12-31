const userService = require('./userService')

exports.login = (req, res) => {
    const wrongPassword = req.query['wrong-password'] !== undefined;
    const usernameExist = req.query['username-exist'] !== undefined;
    const passwordConfirmFailed = req.query['password-confirm-failed'] !== undefined;
    res.render('auth/views/login', {
        wrongPassword,
        usernameExist,
        passwordConfirmFailed,
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
            res.redirect('/login?username-exist')
        } else {
            const user = await userService.register(username, email, password);
            res.redirect('/login?register-successfully')
        }
    } else {
        res.redirect('/login?password-confirm-failed')
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
        email
    } = req.query;
    const activationString = req.query['activation-string'];
    const result = await userService.activate(email, activationString)
    if (result) {
        const user = await userService.findByEmail(email)
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