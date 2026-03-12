const mongoose = require("mongoose");
 

const orderschema = mongoose.Schema({
      name:{
          type:String,
          required:true
      },
      color:{
          type:String,
          required:true
      },
      icon:{
          type:String,
          required:true
      },
      image:{
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
          ref:"Category",
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
})
exports.Order = mongoose.model("Order", orderschema);


