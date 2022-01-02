const Order = require('./orderModel')
// const User = require('../user/userModel')
// const productService = require('../product/productService')

exports.new = () => new Order()

// exports.findByPage = (page, itemPerPage) => Order.find({}).skip(page * itemPerPage).limit(itemPerPage).lean({virtuals: true})

exports.findById = (id) => Order.findById(id)

exports.deleteOne = (id) => Order.deleteOne({ _id: id })

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

// exports.updateStatus = async (id, status) => {
//     try {
//         await Order.updateOne({id: id},{$set: {status: status}})        
//     } catch (error) {
//         console.log(error);
//     }
// }

// exports.sortedByDate = () => Order.find({}).sort({date: 'asc'}).lean()

exports.model = Order