const bcrypt = require('bcrypt');
const randomstring = require("randomstring");

const userModel = require('../../models/User');
const mailTransporter = require('../../service/nodemailer')

exports.findByUsername = (username) => userModel.findOne({
    username: username
}).lean();

exports.checkExists = (username) => userModel.find({
    username: username
}).limit(1).size();

exports.findByEmail = (email) => userModel.findOne({
    email: email
}).lean();

exports.findById = (id) => userModel.findById(id);

exports.validPassword = (password, user) => {
    return bcrypt.compare(password, user.password);
}

exports.register = async (username, email, password) => {
    const passwordHash = await bcrypt.hash(password, 10)
    const activationString = randomstring.generate();
    await userModel.create({
        username: username,
        email: email,
        password: passwordHash,
        status: "inactivated",
        activationString: activationString,
    });
    // send email
    const msg = {
        to: email, // Change to your recipient
        from: process.env.EMAIL_SENDER, // Change to your verified sender
        subject: 'ThavaShop account email activation',
        html: `<h1>Thanks for register your account with ThavaShop</h1>
        <p>Please activate your account <a
        href="${process.env.DOMAIN_NAME}/activate?username=${username}&activation-string=${activationString}"
        >Click here!</a></p>`,
    }
    mailTransporter.sendMail(msg, function (err, data) {
        if (err) {
            console.log(err.message);
        } else {
            console.log('Email sent successfully');
        }
    });
}

exports.activate = async (username, activationString) => {
    const user = await userModel.findOne({
        username: username,
        activationString: activationString
    }).lean();
    if (user) {
        await userModel.updateOne({
            username: username
        }, {
            $set: {
                status: "activated"
            }
        })
        return true;
    }
}

exports.edit = async (id, changes) => {
    try {
        return await userModel.findOneAndUpdate({
            _id: id
        }, changes, {
            new: true
        }).lean()
    } catch (error) {
        console.log(error);
    }
}

exports.changePassword = async (id, password) => {
    try {
        const newPassword = await bcrypt.hash(password, 10)
        return await userModel.findOneAndUpdate({
            _id: id
        }, {
            $set: {
                password: newPassword
            }
        }, {
            new: true
        }).lean()
    } catch (error) {
        console.log(error);
    }
}

exports.findByUsernameAndAS = (username, activationString) => userModel.findOne({
    username: username,
    activationString: activationString
}).lean();