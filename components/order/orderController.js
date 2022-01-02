const orderService = require('./orderService')
const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY)

exports.details = async (req, res) => {
    try {
        const order = await orderService.findById(req.params.id).populate('customer').lean()
        const products = await orderService.getProductEntries(order.details)
        res.render('order/views/details', {
            order: order,
            customer: order.customer,
            products: products
        });
    } catch (err) {
        console.log(err);
        res.render('order/views/details')
    }
}

exports.success = async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.retrieve(req.query.session_id, {
            expand: ['line_items', 'payment_intent', 'line_items.data.price.product']
        });
        const userId = session.payment_intent.metadata.userId
        const products = session.line_items.data.map(entry => {
            return {
                id: entry.price.product.metadata.id,
                amount: entry.quantity
            }
        })

        const order = new orderService.model({
            customer: userId,
            details: products,
            status: session.payment_status,
            paymentType: session.payment_method_types[0]
        })

        try {
            await order.save()
            req.flash('success', 'Order added')
        } catch (err) {
            console.log(err);
            req.flash('error', 'Order add failed')
        }
        res.redirect('/')
        
    } catch (error) {
        console.log(error);
    }
}

// exports.add = async (req, res) => {
//     const body = req.body

//     // test
//     const User = require('../user/userModel')
//     const Product = require('../product/productModel')
//     let user
//     try {
//         user = await User.findById(body.custormer).lean()
//     } catch (err) {
//         console.log(err);
//     }
//     const a = body.products.split(',')
//     let products = []
//     a.forEach(async x => {
//         const item = x.split(' ')
//         products.push({
//             id: item[0],
//             amount: item[1]
//         })
//         await Product.updateOne({ _id: item[0] }, { $inc: { sales: 1 } })
//     });

//     const order = new orderService.model({
//         customer: user._id,
//         details: products,
//         status: body.status,
//         paymentType: body.paymentType
//     })

//     try {
//         await order.save()
//         req.flash('success', 'Order added')
//         renderAddPage(res, orderService.new())
//     } catch (err) {
//         console.log(err);
//         req.flash('error', 'Order add failed')
//         renderAddPage(res, order)
//     }
// }