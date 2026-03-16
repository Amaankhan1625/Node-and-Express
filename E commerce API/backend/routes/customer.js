const express = require('express');
const router = express.Router();
const {Customer}= require("../model/customer");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');



//get all customers
router.get('/',async (req,res)=>{
    const customerList = await Customer.find()//.select('-password');

    if(!customerList){
        res.status(500).json({success:false})
    }

    res.send(customerList);
})

//get customer by id
router.get('/:id',async (req,res)=>{
    const customer = await Customer.findById(req.params.id);

    if(!customer){
        res.status(500).json({success:false})
    }

    res.send(customer);
});

//create customer
router.post(`/`, async (req,res)=>{
    let customer = new Customer({
        name:req.body.name,
        email:req.body.email,
        phone:req.body.phone,
        password:bcrypt.hashSync(req.body.password,10),
        street:req.body.street,
        apartment:req.body.apartment,
        city:req.body.city,
        state:req.body.state,
        zipcode:req.body.zipcode,
        country:req.body.country,
        isAdmin:req.body.isAdmin
    })

    customer = await customer.save();

    if(!customer){
        return res.status(400).send("the customer cannot be created")
    }
    res.send(customer);
})

//login authentication
router.post('/login', async (req,res)=>{
try {

    const SECRET = process.env.SECRET_KEY;
    const customer = await Customer.findOne({ email: req.body.email });

    if(!customer){
        return res.status(404).json({message:"Customer not found"});
    }

    const passwordMatch = bcrypt.compareSync(req.body.password, customer.password);

    if(!passwordMatch){
        return res.status(401).json({message:"Invalid password"});
    }

    const token = jwt.sign(
        {
            customerId: customer.id,
            isAdmin: customer.isAdmin
        },
        SECRET,
        {expiresIn:'1d'}
    );

    res.status(200).json({
        email: customer.email,
        token
    });

}
catch(error){
    res.status(500).json({message:"Server error"});
}
});

module.exports = router;