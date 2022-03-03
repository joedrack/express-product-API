const express = require('express')
const app = express()
// configuring the env
require('dotenv').config({ path: './config/.env' })

// custom error handler
const customErrorhandler = require('./middlewares/customErrorHandler');

/* instead of writting a middleware to handle the try catch block of async code, let's use express-async-errors since it does the job for us. We'll need to throw an error and it will automatically get catched by an error handler
*/
require('express-async-errors');

const productsRouter = require('./routes/products.routes');

// db connection promise
const DBConnection = require('./config/db');

const PORT = process.env.PORT || 5000;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use('/api/products', productsRouter);

app.use(customErrorhandler);
// Page Not Found
app.get('/*', (_, res) => {
    res.status(404).json({ success: false, message: 'Page Not Found' });
})

// launching the API services only when the DB is on
const launchAPI = async () => {
    try {
        await DBConnection(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected...');
        app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));
    } catch (error) {
        console.log('An error occured when connecting to the DB.');
    }
}

launchAPI();