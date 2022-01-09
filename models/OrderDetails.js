const { ObjectId } = require('bson');
const mongoose = require('mongoose')

const schema = mongoose.Schema({
    orderID: {
        type: ObjectId,
        required: true
    },
    productID: {
        type: ObjectId, 
        required: true
    },
    quantity: {
        type: Number
    }
}, {collection: 'orderDetails'});
const OrderDetails = mongoose.model('OrderDetails', schema);
module.exports = OrderDetails;