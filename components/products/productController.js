const productService = require("./productService");

exports.category = async function (req, res) {
  var {
    page,
    sortBy,
    brand,
    color
  } = req.query;
  if (!page) page = 1;

  const products = await productService.filter(
    sortBy?.toLowerCase() ?? "price",
    brand,
    color
  );

  const allProducts = await productService.list();

  const length = products.length;

  const colorsBrandsListProduct = {
    colors: [...new Set(allProducts.map((product) => product.color))],
    brands: [...new Set(allProducts.map((product) => product.brand))],
  };
  // page bar
  const pageIndex = Math.floor(page / 5) * 5 + 1;
  var pageBar = [];
  for (var i = pageIndex; i < pageIndex + 5; i++) {
    var item = {
      page: i,
      active: "",
      params: req.query,
    };
    if (i == page) item.active = "active";

    if (products[(i - 1) * 6]) {
      pageBar.push(item);
    }
  } // show 5 pages each time

  var previous = {
    isHas: true,
    page: pageIndex - 1,
  };

  var next = {
    isHas: true,
    page: pageIndex + 5,
  };

  if (pageIndex == 1) previous.isHas = false;
  if (!products[(pageIndex + 5) * 6]) next.isHas = false;

  // product
  const productToShow = [];
  for (var i = (page - 1) * 6; i < page * 6; i++) {
    if (products[i]) productToShow.push(products[i]);
  }

  res.render("products/views/category.hbs", {
    colorsBrandsListProduct,
    productToShow,
    length,
    pageBar,
    previous,
    next,
  });
};

exports.getProductById = async function (req, res) {
  const product = await productService.productByID(req.params.productId);
  res.render("products/views/detail.hbs", {
    product
  })
};


exports.getProductBySlug = async function (req, res) {
  const product = await productService.productBySlug(req.params.slug)
  const comments = await productService.getProductComment(product._id)
  comments.sort((a, b) => (new Date(b.createAt) - new Date(a.createAt)));
  res.render('products/views/detail.hbs', {
    product,
    comments,
  })
}

exports.postComment = async (req, res, next) => {
  const comment = await productService.postComment(req.body.name, req.body.productId, req.body.content);
  res.redirect(`/category/product/${req.body.slug}#submit-comment`)
}