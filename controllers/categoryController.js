const slugify = require("slugify")
const categorymodel = require("../models/categorymodel")

const createCategory = async(req,res)=>{
try{
    const {name} = req.body
    if(!name){
        res.status(200).send({
            message:"name is required"
        })
    }
    const alreadyExist = await categorymodel.findOne({name});
    if(alreadyExist){
        return res.status.send(200)({
            success: false,
            message: "Category Already Exist",
          });
    }

    const createdCategory = await new categorymodel({name,slug:slugify(name)}).save();
    
    if(createdCategory){
        return res.status(201).send({
            success:true,
            message:"Category Added Successfully"
        })
    }

}catch(error){
    res.status(404).send({
        message:"Error in creating CATEGORY",
        success:false
    })
}
}

const updateCategory = async(req,res)=>{
    try{
        const {id} = req.params;
        const {name} = req.body;
       
        if(!name){
            res.status(200).send({
                message:"name is required"
            })
        }
        const categoryUpdated = await categorymodel.findByIdAndUpdate(id,{name,slug:slugify(name)},{new:true});
       
        if(categoryUpdated){
            return res.status(201).send({
                success:true,
                message:"Category Updated Successfully"
            })
        }
    
    }catch(error){
        res.status(404).send({
            message:"Error in Updating CATEGORY",
            success:false
        })
    }
    }

const deleteCategory = async(req,res)=>{
    try{
        const {id} = req.params;
       
        
        const categoryUpdated = await categorymodel.findByIdAndDelete(id);
       
        if(categoryUpdated){
            return res.status(201).send({
                success:true,
                message:"Category Deleted Successfully"
            })
        }
    
    }catch(error){
        res.status(404).send({
            message:"Error in Updating CATEGORY",
            success:false
        })
    }
}

const allCategory = async(req,res)=>{
try{

const Categories = await categorymodel.find({})
    return res.status(201).send({
        success:true,
        message:"All categories list",
        Categories
    })


}catch(error){
    res.status(404).send({
        message:"Error in Getting All CATEGORY",
        success:false
    })
}

}

const singleCategory = async(req,res)=>{
    try{
    
    const Category = await categorymodel.findOne({slug:req.params.slug})
    if(Category){
        return res.status(201).send({
            success:true,
            message:"Single Category",
            Category
        })
    }
    res.status(200).send({
        success:false,
        message:"Category Does not exist with this name"
    })
    
    }catch(error){
        res.status(404).send({
            message:"Error in Getting Single CATEGORY",
            success:false
        })
    }
    
    }

module.exports.createCategory = createCategory;
module.exports.updateCategory = updateCategory;
module.exports.deleteCategory = deleteCategory;
module.exports.allCategory = allCategory;
module.exports.singleCategory = singleCategory;