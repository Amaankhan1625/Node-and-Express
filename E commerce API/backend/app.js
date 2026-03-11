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


const productschema = mongoose.Schema({
    name:String,
    image:String,
    Instock:Number
})

const Product = mongoose.model("Product", productschema);

app.get('/',(req,res)=>{
    res.send("hello world!");
})

app.get(`${api}/products`,async (req,res)=>{
    const productList = await Product.find();

    if(!productList){
        res.status(500).json({success:false})
    }

    res.send(productList);
})

app.post(`${api}/products`,(req,res)=>{
    const product = new Product({
        name:req.body.name,
        image:req.body.image,
        Instock:req.body.Instock
    })

    product.save().then((createdProduct)=>{
        res.status(201).json(createdProduct);
    })
    .catch((err)=>{
        res.status(500).json({
            error:err,
            success:false
        })
    })
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