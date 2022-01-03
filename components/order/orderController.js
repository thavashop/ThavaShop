const orderService = require('./orderService')
const cartService = require('../cart/cartService')
const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY)

exports.history = async (req, res) => {
    try {
        const orders = await orderService.findByCustomer(req.user._id)
        res.render('order/views/history', {orders})
    } catch (error) {
        console.log(error);
    }
}

exports.details = async (req, res) => {
    try {
        const order = await orderService.findById(req.params.id).lean()
        const products = await orderService.getProductEntries(order.details)
        order.total = order.ship + order.subtotal
        res.render('order/views/details', {order, products});
    } catch (err) {
        console.log(err);
        res.render('order/views/details')
    }
}

exports.success = async (req, res) => {
    try {
        // get information
        const session = await stripe.checkout.sessions.retrieve(req.query.session_id, {
            expand: ['line_items', 'payment_intent', 'line_items.data.price.product']
        });
        const userId = session.payment_intent.metadata.userId
        const products = session.line_items.data.map(entry => ({
            id: entry.price.product.metadata.id,
            amount: entry.quantity
        }))
        try {
            // add order
            await orderService.add(userId, products, session.amount_total/100, session.payment_method_types[0])
            req.flash('success', 'Order added')

            // clear cart
            await cartService.clear(userId)
            return res.render('order/views/thankyou')

        } catch (err) {
            console.log(err);
            req.flash('error', 'Order add failed')
        }
    } catch (error) {
        console.log(error);
    }
    res.render('error')
}