const express = require('express');
const router = express.Router();
const {Category}= require("../model/category");


router.get('/category',(req,res)=>{
    res.send("CATEGORY API");
})


//get all categories
router.get('/',async (req,res)=>{                       //async is used to wait for the data to be fetched from the database before sending the response to the client.
    const categoryList = await Category.find();

    if(!categoryList){
        res.status(500).json({success:false})
    }

    res.status(200).json({success:true,data:categoryList});
})

//get category by id
router.get('/:id',async (req,res)=>{
    const category = await Category.findById(req.params.id);

    if(!category){
        res.status(500).json({success:false})
    }

    res.status(200).json({success:true,data:category});
})                 

router.put('/:id',async (req,res)=>{
    const category = await Category.findByIdAndUpdate(
        req.params.id,
        {
            name:req.body.name,      //request body is used to get the data from the client side.
            icon:req.body.icon,
            color:req.body.color
        },
        {new:true}              //new:true is used to return the updated category to the client side.
    )
    if(!category){
        return res.status(404).send("the category cannot be updated");
    }
    res.send(category);
})

 

//post a category or create a category
router.post('/',async (req,res)=>{
    let category = new Category({
        name:req.body.name,      //request body is used to get the data from the client side.
        icon:req.body.icon,
        color:req.body.color
    })

    category = await category.save();

    if(!category){
        return res.status(404).send("the category cannot be created");
    }
    res.send(category);
    })


    //delete a category
router.delete('/:id',async (req,res)=>{
     Category.findByIdAndDelete(req.params.id)
     .then(category=>{
        if(category){
            return res.status(200).json({success:true,message:"the category is deleted"})
        }
        else{
            return res.status(404).json({success:false,message:"category not found"})
        }
        })
    .catch(err=>{
        return res.status(400).json({success:false,error:err})
    })
})


module.exports = router;