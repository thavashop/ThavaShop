const Product = require("../../models/Product");
const Comment = require("../../models/Comment");

exports.filter = function (sortBy, filter) {
  return Product.find(filter)
    .sort({ [sortBy]: 1 })
    .lean();
};

exports.list = () => Product.find({}).lean();

exports.getProductsByIds = (ids) =>
  Product.find({
    _id: {
      $in: ids,
    },
  }).lean();

exports.productByID = (id) =>
  Product.findOne({
    _id: id,
  }).lean();

exports.count = () => Product.count({}).exec();

exports.findByPage = (page, itemPerPage) =>
  Product.find({})
    .skip(page * itemPerPage)
    .limit(itemPerPage);

exports.productBySlug = (slug) =>
  Product.findOne({
    slug: slug,
  }).lean();

exports.top = (n) => Product.find({}).sort({ sales: "desc" }).limit(n).lean();

exports.postComment = (name, productId, content) => {
  return new Comment({
    name: name,
    productId: productId,
    content: content,
    createAt: new Date(),
  }).save();
};

exports.getProductComment = (productId) =>
  Comment.find({ productId: productId }).lean();

exports.searchByName = (name) => Product.find({ "name": { "$regex": name, "$options": "i" } })

exports.getRelatedProducts = (brand, id) => Product.find({brand: brand, _id: {"$ne": id}}).limit(4).lean()