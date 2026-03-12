const mongoose = require("mongoose");


const customerschema = mongoose.Schema({
    name:String,
    image:String,
    Instock:{
        type:Number,
        required:true
    }
})
exports.Customer = mongoose.model("Customer", customerschema);