const userModel = require('../../models/User');

exports.findByUsername = (username) => userModel.findOne({
    username: username
}).lean();

exports.validPassword = (password, user) => {
    return user.password === password;
}