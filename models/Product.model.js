const mongoose = require('mongoose')
const {Schema, model} = mongoose

const ProductSchema = new Schema({
    name: { 
        type: String,
        required: [true, 'The product name is required'],
        maxLength: [40, 'The product should be less or equal to 40 characters'],
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'the product price shoud be provied']
    },
    featured: {
        type: Boolean,
        default: false
    },
    rating: {
        type: Number,
        default: 4.5
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    company: {
        type: String,
        enum: {
            values: ['A','B','C'],
            message: '{VALUE} is not supported'
        }
    }
});

const Product = model('Product', ProductSchema);

module.exports = Product;