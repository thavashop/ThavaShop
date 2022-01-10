var express = require('express');
var router = express.Router();
const productService = require('../components/products/productService')
// const loggedInUserGuard = require('../middlewares/loggedInUserGuard')

/* GET home page. */
router.get('/', async function (req, res, next) {
  const topProduct = await productService.top(7);
  res.render('index', {topProduct});
});

router.get('/basket', function(req, res, next) {
  res.render('basket');
});

router.get('/contact', function(req, res, next) {
  res.render('contact');
});

router.get('/detail', function(req, res, next) {
  res.render('detail');
});

// router.get('/register', function(req, res, next) {
//   res.render('./auth/views/login');
// });

// router.get('/login', function(req, res, next) {
//   res.render('./auth/views/login');
// });

router.get('/text', function(req, res, next) {
  res.render('text');
});


module.exports = router;
