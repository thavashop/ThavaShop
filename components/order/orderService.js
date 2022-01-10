const Order = require('./orderModel')
const productService = require('../products/productService')

exports.new = () => new Order()

exports.findById = (id) => Order.findById(id)

exports.add = (customer, details, subtotal, paymentType, delivery, address) => {
    const order = new Order({customer, details, subtotal, paymentType , delivery, address})
    order.save()
}

exports.findByCustomer = (customer) => Order.find({customer: customer}).lean()

exports.getProductEntries = async (details) => {
    let entries = []
    for (const entry of details) {
        try {
            const product = await productService.productByID(entry.id)
            entries.push({
                image: product.image,
                name: product.name,
                quantity: entry.quantity,
                price: product.price,
                total: Number(entry.quantity * product.price).toFixed(2),
                slug: product.slug,
            })
        } catch (err) {
            console.log(err);
        }
    }
    return entries
}

exports.model = Order