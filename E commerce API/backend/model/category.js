const mongoose = require("mongoose");


const categoryschema= mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    icon:{
        type:String,
        required:true
    },
    color:{
        type:String,
        required:true
    }
})
exports.Category = mongoose.model("category",categoryschema);