const mongoose = require("mongoose");

const productschema = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    richdescription:{
        type:String,
        required:true
    },
    brand:{
        type:String
    },
    images:[{
        type:String,
        default:""
    }],
    price:{
        type:Number,
        required:true
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"category",
        required:true
    },    
    Instock:{
        type:Number,
        required:true,
        min:0,
        max:255
    },
    numReviews:{
        type:Number,
        default:0
    },
    rating:{
        type:Number,
        default:0
    },
    isFeatured:{
        type:Boolean,
        default:false
    },
    dateCreated:{
        type:Date,
        default:Date.now
    }
});

productschema.virtual('id').get(function(){
    return this._id.toHexString();
});

productschema.set('toJSON', {
    virtuals: true
});

exports.Product = mongoose.model("Product", productschema);