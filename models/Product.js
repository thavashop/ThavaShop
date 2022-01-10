const mongoose = require("mongoose");
const slugGenerator = require('mongoose-slug-generator');
mongoose.plugin(slugGenerator);

const schema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  image: Array,
  material: String,
  gender: String,
  type: String,
  care: String,
  brand: String,
  color: String,
  size: Array,
  description: String,
  slug: {
    type: String,
    slug: 'name',
  },
  sales: {
    type: Number,
    default: 0
}
});

module.exports = mongoose.model("Product", schema, "product");
module.exports.everySize = ["S", "M", "L", "XL", "XXL"];
