import SubCategory from "../models/subCategoryModel.js"

export const AddSubCategoryController = async(req, res)=>{
    try {
        const { name, Image, category } = req.body 

        if(!name && !Image && !category[0] ){
            return res.status(400).json({
                message : "All fields are required",
                error : true,
                success : false
            })
        }

        const payload = {
            name,
            Image,
            category
        }

        const createSubCategory = new SubCategory(payload)
        const save = await createSubCategory.save()

        return res.json({
            message : "Sub Category added successfully",
            data : save,
            error : false,
            success : true
        })

    } catch (error) {
        return res.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

export const getSubCategoryController = async(req, res)=>{
    try {
        const data = await SubCategory.find().sort({createdAt : -1}).populate('category')
        return res.json({
            message : "Sub Category fetched successfully",
            data : data,
            error : false,
            success : true
        })
    } catch (error) {
        return res.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

export const updateSubCategoryController = async(req,res)=>{
    try {
        const { _id, name, Image, category } = req.body 

        const checkSub = await SubCategory.findById(_id)

        if(!checkSub){
            return res.status(400).json({
                message : "Sub Category not found",
                error : true,
                success : false
            })
        }

        const updateSubCategory = await SubCategory.findByIdAndUpdate(_id,{
            name,
            Image,
            category
        })

        return res.json({
            message : 'Sub Category updated successfully',
            data : updateSubCategory,
            error : false,
            success : true
        })

    } catch (error) {
        return res.status(500).json({
            message : error.message || error,
            error : true,
            success : false 
        })
    }
}

export const deleteSubCategoryController = async(req,res)=>{
    try {
        const { _id } = req.body 
        console.log("Id", _id)
        const deleteSub = await SubCategory.findByIdAndDelete(_id)

        return res.json({
            message : "Sub Category deleted successfully",
            data : deleteSub,
            error : false,
            success : true
        })
    } catch (error) {
        return res.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}