const Order = require('./orderModel')
// const User = require('../user/userModel')
// const productService = require('../product/productService')

exports.new = () => new Order()

exports.findById = (id) => Order.findById(id)

exports.add = (customer, details, paymentType) => {
    const order = new Order({customer,details,paymentType})
    order.save()
}

// exports.getProductEntries = async (details) => {
//     let entries = []
//     for (const entry of details) {
//         try {
//             const product = await productService.findById(entry.id)
//             entries.push({
//                 imageObj: product.imageObj,
//                 name: product.name,
//                 amount: entry.amount
//             })
//         } catch (err) {
//             console.log(err);
//         }
//     }
//     return entries
// }

exports.model = Order