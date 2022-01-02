const mongoose = require('mongoose')

const schema = mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    details: {
        type: Array
    },
    status: {
        type: String,
        default: 'not delivered'
    },
    paymentType: String,
    date: {
        type: Date,
        default: Date.now()
    }
})

module.exports = mongoose.model('Order', schema, 'order')