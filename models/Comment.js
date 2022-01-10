const mongoose = require('mongoose')

const schema = mongoose.Schema({
    name: { type: String, required: true},
    productId: { type: mongoose.Types.ObjectId, required: true },
    content: { type: String, required: true},
    createAt: {type: Date},
});
const Comment = mongoose.model('Comment', schema, 'comments');
module.exports = Comment;