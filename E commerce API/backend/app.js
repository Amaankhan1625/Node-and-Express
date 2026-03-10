const express = require("express");
const mongoose = require("mongoose")
const app = express();
require('dotenv/config');
const api = process.env.API_URL;
const bodyParser = require('body-parser');
const morgan = require('morgan');


//middle wares
app.use(bodyParser.json());
app.use(morgan('tiny'));



app.get('/',(req,res)=>{
    res.send("hello world!");
})

app.get(`${api}/products`,(req,res)=>{
    const product = {
        id:1,
        name:"iphone 12",
        image:"https://www.apple.com/v/iphone-12/f/images/overview/hero/iphone_12__d51ddqz0sm2e_large.jpg",
        price:999
    }
    res.send(product);
})

app.post(`${api}/products`,(req,res)=>{
    const newproduct = req.body;
    console.log(newproduct);
    res.send(newproduct);
})

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