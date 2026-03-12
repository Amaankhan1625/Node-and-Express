const express = require("express");
const mongoose = require("mongoose")
const app = express();
require('dotenv/config');
const api = process.env.API_URL;
const bodyParser = require('body-parser');
const morgan = require('morgan');

const productsRoute = require("./routes/product");
const categoriesRoute = require("./routes/category");
const orderRoute = require("./routes/order");
const customerRoute = require("./routes/customer");

//middle wares
app.use(bodyParser.json());
app.use(morgan('tiny'));

app.use(`${api}/products`,productsRoute);
app.use(`${api}/categories`,categoriesRoute);
app.use(`${api}/orders`,orderRoute);
app.use(`${api}/customers`,customerRoute);

const Product = require("./model/product");



mongoose.connect(process.env.CONNECTION_STRING)
.then(()=>{
    console.log("database connection is ready")
})
.catch((err)=>{
    console.log(err);
})



app.listen(3000,()=>{
   
    console.log("server is running")
})