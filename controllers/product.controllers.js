const Product = require('../models/Product.model');
const asyncWrapper = require('../middlewares/asyncWrapper');

// this fn will be responsible for getting all products without filtering them.
exports.getAllProductsStatic = async (req, res) => {
    const products = await Product.find({}).sort('-price').select('price');
    res.status(200).json({ success: true, data: { products, nbHints: products.length }});
}

exports.getAllProducts = async (req, res) => {
    /**
     * Let's handle some filtering. To avoid filtering on unwanted query variable, better specify the value eligible
     * for filtering. 
     */
    const { featured, company, name, sort, fields, numericalFilters } = req.query;
    /*this will be returned when the query variable is not eligible to filtering which will result in getting all #products since it's an empty. --> Product.find({})
    */
    const queryObject = {};

    /* adding a featured property to the queryObejct with the value of the query variable and set it to a Boolean since in the modal the type of the #featured is Boolean */
    if(featured) {
        queryObject.featured = featured === 'true' ? true : false
    }

    // we do not need to check for company here since the enum will do the work for us.
    if(company) {
        queryObject.company = company;
    }

    if(name) {
        queryObject.name = { $regex: name, $options: 'i' }; // i means case insentive
    }

    if(numericalFilters) {
        const operatorMap = {
            '<': '$lt',
            '<=': '$lte',
            '=': '$eq',
            '>': '$gt',
            '>=': '$gte'
        }
        
        const regExp = /\b(<|<=|=|>|>=)\b/g
        const options = ['price','rating']

        // https://www.w3schools.com/jsref/jsref_replace.asp
        let filters = numericalFilters.replace(regExp, (match) => `-${operatorMap[match]}-`);
        filters.split(',').forEach(filter => {
            const [field, operand, value] = filter.split('-')
            if(options.includes(field)) { // makes sure that we apply this filter to price and rating field
                // https://mongoosejs.com/docs/queries.html
                queryObject[field] ={ [operand]: Number(value) };  //price: { $gt: 50 }
            }
        });
    }
    console.log(queryObject);


    /* const products = await Product.find(queryObject); */
    /* since we need to appy the filter before sending back the proper result, we need to get first the filter result and then await it after. In this case we'll sure to get meangfull result from the MongoDB
    */

    let result = Product.find(queryObject) // this represent the data set on which we'll chain on the sort and select

    if(sort) {
        /**
         * since the result will be a long string, eg: name,-price,featured, we need to convert it an meaningful string to mongoDB, i.e name -price featured ,so that so that the sort becomes possible.
         * Steps: convert the long string in an array and then convert that array in string by separating the words by blank space.
         */
        let sortList = sort.split(',').join(' ');
        // sort based on the sortList value.
        result.sort(sortList);
    }else{
        /* sort by createdAt(this refer to the key createdAt in the ProductSchema) by default to get data in an ascending order. But we can also sort by price like: ## result.sort('price') or result.sort('-price') ##
        */
        result.sort('createdAt');
    }

    if(fields) {
        const fieldsList = fields.split(',').join(' ')
        result.select(fieldsList);
    }
    
    /**
     * when page or limit will be NaN or not defined the #||# will come into play.
     * Notice that this technique can be used in pagination
     */
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    result.skip(skip).limit(limit);
 
    const products = await result

    res.json({ products, nbHints: products.length });
}

exports.getSingleProduct = async (req, res) => {
    const { id: productID } = req.params;
    // res.json({ productID })
    const product = await Product.findOne({_id: productID});

    if(!product) throw Error(`Product with ID ${productID} is not found.`);

    res.status(200).json({ success: true, product });
};

exports.createProduct = async (req, res) => {
    const product = await Product.create(req.body);
    res.status(201).json({ product });
}