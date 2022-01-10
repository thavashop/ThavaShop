const { everySize: productSize } = require("../../models/Product");
const productService = require("./productService");

exports.category = async function (req, res) {
  let { page, sortBy, brand, color, size, material, search } = req.query;
  if (!page) page = 1;

  let filter = {
    ...(brand ? { brand } : {}),
    ...(color ? { color } : {}),
    ...(size ? { size } : {}),
    ...(material ? { material } : {}),
  };


  let field, type
  if (sortBy) {
    const sortValue = sortBy.split('_')
    field = sortValue[0]
    type = sortValue[1]
  }

  let products = await productService.filter(
    field,
    type,
    filter
  );

  if (search) {
    const searchProduct = products.filter((product) => product.name.toLowerCase().includes(search.toLowerCase()))
    products = searchProduct
  }

  const allProducts = await productService.list();

  const length = products.length;

  const attrsProductList = {
    colors: [...new Set(allProducts.map((product) => product.color))],
    brands: [...new Set(allProducts.map((product) => product.brand))],
    sizes: productSize,
    materials: [...new Set(allProducts.map((product) => product.material))],
  };
  // page bar
  const pageIndex = Math.floor((page - 1) / 5) * 5 + 1;
  let pageBar = [];
  for (let i = pageIndex; i < pageIndex + 5; i++) {
    let item = {
      page: i,
      active: "",
      params: req.query,
    };
    if (i == page) item.active = "active";

    if (products[(i - 1) * 6]) {
      pageBar.push(item);
    }
  } // show 5 pages each time

  let previous = {
    isHas: true,
    page: pageIndex - 1,
  };

  let next = {
    isHas: true,
    page: pageIndex + 5,
  };

  if (pageIndex == 1) previous.isHas = false;
  if (!products[(pageIndex + 4) * 6 + 1]) next.isHas = false;

  // product
  const productToShow = [];
  for (let i = (page - 1) * 6; i < page * 6; i++) {
    if (products[i]) productToShow.push(products[i]);
  }

  const brandAttr = Array.isArray(brand) ? brand : [brand]
  const colorAttr = Array.isArray(color) ? color : [color]
  const sizeAttr = Array.isArray(size) ? size : [size]
  const materialAttr = Array.isArray(material) ? material : [material]

  let searchAttr = {
    'brand': brandAttr ? [...brandAttr] : [] ,
    'color': colorAttr ? [...colorAttr] : [] ,
    'size': sizeAttr ? [...sizeAttr] : [] ,
    'material': materialAttr ? [...materialAttr] : [] ,
  };

  res.render("products/views/category.hbs", {
    searchAttr,
    attrsProductList,
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
    product,
  });
};

exports.renderDetail = async function (req, res) {
  const product = await productService.productBySlug(req.params.slug);
  const relatedProducts = await productService.getRelatedProducts(product.brand, product._id)
  const comments = await productService.getProductComment(product._id);
  comments.sort((a, b) => new Date(b.createAt) - new Date(a.createAt));

  const size = comments.length;

  let { pageComment: page } = req.query;
  if (!page) page = 1;

  // page bar
  const pageIndex = Math.floor((page - 1) / 5) * 5 + 1;
  let pageBar = [];
  for (let i = pageIndex; i < pageIndex + 5; i++) {
    let item = {
      page: i,
      active: "",
    };
    if (i == page) item.active = "active";

    if (comments[(i - 1) * 6]) {
      pageBar.push(item);
    }
  } // show 5 pages each time

  let previous = {
    isHas: true,
    page: pageIndex - 1,
  };

  let next = {
    isHas: true,
    page: pageIndex + 5,
  };

  if (pageIndex == 1) previous.isHas = false;
  if (!comments[(pageIndex + 4) * 6]) next.isHas = false;

  // product
  const commentsToShow = [];
  for (let i = (page - 1) * 6; i < page * 6; i++) {
    if (comments[i]) commentsToShow.push(comments[i]);
  }

  commentsToShow.map((comment) => {
    comment.createAt = timeSince(comment.createAt);
    return comment;
  });

  res.render("products/views/detail.hbs", {
    product,
    relatedProducts,
    commentsToShow,
    size,
    pageBar,
    previous,
    page,
    next,
  });
};

exports.postComment = async (req, res, next) => {
  const comment = await productService.postComment(
    req.body.name,
    req.body.productId,
    req.body.content
  );
  comment.slug = req.body.slug;
  res.status(200).json(comment);
};

function timeSince(date) {
  var seconds = Math.floor((new Date() - date) / 1000);

  var interval = seconds / 31536000;

  if (interval > 1) {
    return Math.floor(interval) + " years";
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + " months";
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + " days";
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + " hours";
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + " minutes";
  }
  return Math.floor(seconds) + " seconds";
}
