import Product from "../models/productModel.js";

export const createProduct = async(req, res)=>{
    try {
        const { 
            name,
            image,
            category,
            subCategory,
            unit,
            stock,
            price,
            discount,
            description,
            more_details,
        } = req.body 

        if(!name || !image[0] || !category[0] || !subCategory[0] || !unit || !price || !description ){
            return res.status(400).json({
                message : "All fields are required",
                error : true,
                success : false
            })
        }

        const product = new Product({
            name ,
            image ,
            category,
            subCategory,
            unit,
            stock,
            price,
            discount,
            description,
            more_details,
        })
        const saveProduct = await product.save()

        return res.json({
            message : "Product Created Successfully",
            data : saveProduct,
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

export const getProduct = async(req,res)=>{
    try {
        
        let { page, limit, search } = req.body 

        if(!page){
            page = 1
        }

        if(!limit){
            limit = 10
        }

        const query = search ? {
            $text : {
                $search : search
            }
        } : {}

        const skip = (page - 1) * limit

        const [data,totalCount] = await Promise.all([
            Product.find(query).sort({createdAt : -1 }).skip(skip).limit(limit).populate('category subCategory'),
            Product.countDocuments(query)
        ])

        return res.json({
            message : "Product list",
            error : false,
            success : true,
            totalCount : totalCount,
            totalNoPage : Math.ceil( totalCount / limit),
            data : data
        })
    } catch (error) {
        return res.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

export const getProductByCategory = async(req,res)=>{
    try {
        const { id } = req.body 

        if(!id){
            return res.status(400).json({
                message : "provide category id",
                error : true,
                success : false
            })
        }

        const product = await Product.find({ 
            category : { $in : id }
        }).limit(15)

        return res.json({
            message : "category product list",
            data : product,
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

export const getProductByCategoryAndSubCategory  = async(req,res)=>{
    try {
        const { categoryId,subCategoryId,page,limit } = req.body

        if(!categoryId || !subCategoryId){
            return res.status(400).json({
                message : "Provide categoryId and subCategoryId",
                error : true,
                success : false
            })
        }

        if(!page){
            page = 1
        }

        if(!limit){
            limit = 10
        }

        const query = {
            category : { $in :categoryId  },
            subCategory : { $in : subCategoryId }
        }

        const skip = (page - 1) * limit

        const [data,dataCount] = await Promise.all([
            Product.find(query).sort({createdAt : -1 }).skip(skip).limit(limit),
            Product.countDocuments(query)
        ])

        return res.json({
            message : "Product list",
            data : data,
            totalCount : dataCount,
            page : page,
            limit : limit,
            success : true,
            error : false
        })

    } catch (error) {
        return res.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

export const getProductDetails = async(req,res)=>{
    try {
        const { productId } = req.body 

        const product = await Product.findOne({ _id : productId })


        return res.json({
            message : "product details",
            data : product,
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

//update product
export const updateProductDetails = async(req,res)=>{
    try {
        const { _id } = req.body 

        if(!_id){
            return res.status(400).json({
                message : "provide product _id",
                error : true,
                success : false
            })
        }

        const updateProduct = await Product.updateOne({ _id : _id },{
            ...req.body
        })

        return res.json({
            message : "updated successfully",
            data : updateProduct,
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

//delete product
export const deleteProductDetails = async(req,res)=>{
    try {
        const { _id } = req.body 

        if(!_id){
            return res.status(400).json({
                message : "provide _id ",
                error : true,
                success : false
            })
        }

        const deleteProduct = await Product.deleteOne({_id : _id })

        return res.json({
            message : "Product deleted successfully",
            error : false,
            success : true,
            data : deleteProduct
        })
    } catch (error) {
        return res.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

//search product
export const searchProduct = async(req,res)=>{
    try {
        let { search, page , limit } = req.body 

        if(!page){
            page = 1
        }
        if(!limit){
            limit  = 10
        }

        const query = search ? {
            $text : {
                $search : search
            }
        } : {}

        const skip = ( page - 1) * limit

        const [data,dataCount] = await Promise.all([
            Product.find(query).sort({ createdAt  : -1 }).skip(skip).limit(limit).populate('category subCategory'),
            Product.countDocuments(query)
        ])

        return res.json({
            message : "Product data",
            error : false,
            success : true,
            data : data,
            totalCount :dataCount,
            totalPage : Math.ceil(dataCount/limit),
            page : page,
            limit : limit 
        })


    } catch (error) {
        return res.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}