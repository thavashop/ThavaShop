const Order = require('./orderModel')
const productService = require('../products/productService')

exports.new = () => new Order()

exports.findById = (id) => Order.findById(id)

exports.add = (customer, details, subtotal, paymentType) => {
    const order = new Order({customer, details, subtotal, paymentType})
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
                amount: entry.amount,
                price: product.price,
                total: entry.amount * product.price,
                slug: product.slug,
            })
        } catch (err) {
            console.log(err);
        }
    }
    return entries
}

exports.model = Order