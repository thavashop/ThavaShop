const orderService = require('./orderService')
const cartService = require('../cart/cartService')
const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY)

exports.renderCheckoutAddress = async (req, res) => {
    res.render('order/views/checkoutAddress', { account: req.user, address: req.cookies.address ?? {} })
}

exports.checkoutAddress = async (req, res) => {
    res.cookie('address', req.body)
    res.redirect('/order/checkout/delivery')
}

exports.renderCheckoutDelivery = async (req, res) => {
    res.render('order/views/checkoutDelivery', { choice: req.cookies.delivery })
}

exports.checkoutDelivery = async (req, res) => {
    res.cookie('delivery', req.body.delivery)
    res.redirect('/order/checkout/payment')
}

exports.renderCheckoutPayment = async (req, res) => {
    res.render('order/views/checkoutPayment', { choice: req.cookies.payment })
}

exports.checkoutPayment = async (req, res) => {
    const { payment } = req.body
    res.cookie('payment', payment)
    if (payment == 'cod') res.redirect('/order/checkout/review')
    else {
        try {
            const customer = res.locals?.user;
            const {delivery} = req.cookies
            const cart = await cartService.getCart(res.locals?.user._id);
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                mode: 'payment',
                shipping_options: [{
                    shipping_rate_data: {
                        display_name: delivery,
                        type: 'fixed_amount',
                        fixed_amount: {
                            amount: getShipCost(req) * 100,
                            currency: 'usd'
                        }
                    }
                }],
                payment_intent_data: { metadata: {userId: customer._id,}},
                line_items: cart.products.map(entry => ({
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: entry.productId.name,
                            images: [entry.productId.image],
                            description: entry.productId.description,
                            metadata: { id: `${entry.productId._id}` },
                        },
                        unit_amount: Math.ceil(entry.productId.price * 100)
                    },
                    quantity: entry.quantity,
                })),
                success_url: `${process.env.DOMAIN_NAME}/order/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.DOMAIN_NAME}/order/checkout/payment`,
                customer_email: customer.email
            })
            res.redirect(session.url)
        } catch (error) {
            console.log(error);
        }
    }
}

exports.renderCheckoutReview = async (req, res) => {
    const cart = await cartService.getCart(res.locals?.user._id);
    let sub = 0
    const entries = cart.products.map(entry => {
        const { productId: product } = entry
        const { quantity: q } = entry
        const t = Number(product.price * q).toFixed(2)
        sub += Number(t)
        return { ...product, quantity: q, total: product.price * q }
    })
    res.cookie('subtotal', sub)

    const order = { subtotal: sub, ship: getShipCost(req) }
    populateOrder(order)
    res.render('order/views/checkoutReview', { entries, order })
}

exports.checkoutReview = async (req, res) => {
    try {
        // get information
        const userId = res.locals?.user._id;
        const cart = await cartService.getCartWithoutPopulate(userId);
        const products = cart.products.map(({ productId, quantity }) => ({ id: productId, quantity }))
        const { subtotal, payment, delivery, address } = req.cookies

        // add order
        await orderService.add(userId, products, subtotal, payment, delivery, address)
        req.flash('success', 'Order added')

        // clean up
        await clearCartAndCookies(res, userId)
        res.render('order/views/thankyou')

    } catch (err) {
        console.log(err);
        req.flash('error', 'Order add failed')
    }
}

exports.history = async (req, res) => {
    try {
        const orders = await orderService.findByCustomer(req.user._id)
        res.render('order/views/history', { orders })
    } catch (error) {
        console.log(error);
    }
}

exports.details = async (req, res) => {
    try {
        let order = await orderService.findById(req.params.id).lean()
        const products = await orderService.getProductEntries(order.details)
        populateOrder(order)
        res.render('order/views/details', { order, products });
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
            quantity: entry.quantity
        }))
        const { payment, delivery, address } = req.cookies

        // add order
        await orderService.add(userId, products, session.amount_total / 100, payment, delivery, address)
        req.flash('success', 'Order added')

        // clean up
        await clearCartAndCookies(res, userId)
        return res.render('order/views/thankyou')

    } catch (error) {
        req.flash('error', 'Order add failed')
        console.log(error);
        res.render('error')
    }
}

function populateOrder(order) {
    order.tax = 0
    order.total = order.subtotal + order.ship + order.tax
    const keys = ['subtotal', 'ship', 'tax', 'total']
    keys.forEach(key => order[`${key}`] = Number(order[`${key}`]).toFixed(2))
}

async function clearCartAndCookies(res, userId) {
    await cartService.clear(userId)
    res.cookie('cartLength', 0)
    res.clearCookie('subtotal')
    res.clearCookie('payment')
    res.clearCookie('address')
    res.clearCookie('delivery')
}

function getShipCost(req) { return req.cookies.delivery == 'normal' ? 10 : 20 }