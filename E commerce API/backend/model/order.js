const mongoose = require("mongoose");
 

const orderschema = mongoose.Schema({
     
    orderItem : [{
      type:mongoose.Schema.Types.ObjectId,
      ref:'OrderItem',
      required:true
    }],

    shippingAdd1:{
        type:String,
        required:true
    },

     shippingAdd2:{
        type:String,
        required:true
    },
     city:{
        type:String,
        required:true
    },
      zip:{
        type:String,
        required:true
    },
      country:{
        type:String,
        required:true
    },
      phone:{
        type:String,
        required:true
    },
      status:{
        type:String,
        required:true
    },
     totalprice:{
        type:Number,
        required:true
    },
    customer:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Customer",
        required:true
    },
    paymentMethod:{
        type:String,
        enum:['cod', 'card', 'upi', 'netbanking', 'emi'],
        required:true
    },
    datecreated:{
      type:Date,
      deafault:Date.now()
    }
})
orderschema.virtual('id').get(function(){
    return this._id.toHexString();
});

orderschema.set('toJSON', {
    virtuals: true
});

    


exports.Order = mongoose.model("Order", orderschema);


