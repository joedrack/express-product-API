const { append } = require('express/lib/response');

const router = require('express').Router();
const {
    getAllProducts,
    createProduct,
    getSingleProduct,
    getAllProductsStatic
} = require('../controllers/product.controllers')

router.route('/').get(getAllProducts).post(createProduct);
router.route('/static').get(getAllProductsStatic);
router.route('/:id').get(getSingleProduct);

module.exports = router