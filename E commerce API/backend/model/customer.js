const mongoose = require("mongoose");


let customerschema = mongoose.Schema({
   name: {
      type: String,
      required: true},
    email: {
        type: String,
        required: true,
        unique: true},
    phone:{
        type: String,
        required: true
        },
    password: {
        type: String,
        required: true},
    street:{
        type: String,
        required: true},
    city:{
        type: String,
        required: true},
    state:{
        type: String,
        required: true},
    apartment:{
        type: String,
        required: true},
    zipcode:{
        type: String,
        required: true},
    country:{
        type: String,
        default:''
    },
    isAdmin:{
        type: Boolean,
        default: false
    }
});



customerschema.virtual('id').get(function(){
    return this._id.toHexString();
});

customerschema.set('toJSON',{
    virtuals: true,
});


exports.Customer = mongoose.model("Customer", customerschema);
exports.customerSchema = customerschema;