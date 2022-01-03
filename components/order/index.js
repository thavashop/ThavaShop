var express = require('express');
var router = express.Router();
const controller = require('./orderController')

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
