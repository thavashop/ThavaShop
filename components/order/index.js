var express = require('express');
var router = express.Router();
const controller = require('./orderController')

// checkout
router.route('/checkout/address')
    .get(controller.renderCheckoutAddress)
    .post(controller.checkoutAddress)
router.route('/checkout/delivery')
    .get(controller.renderCheckoutDelivery)
    .post(controller.checkoutDelivery)
router.route('/checkout/payment')
    .get(controller.renderCheckoutPayment)
    .post(controller.checkoutPayment)
router.route('/checkout/review')
    .get(controller.renderCheckoutReview)
    .post(controller.checkoutReview)

// order history
router.get('/', controller.history);

// success order handle
router.get('/success', controller.success)

// // order details
router.get('/:id', controller.details)

// edit order
// router.get('/:id/edit', controller.renderEdit)
// router.get('/:id/edit', controller.edit)

// delete order
// router.delete('/:id', controller.delete)

module.exports = router;
