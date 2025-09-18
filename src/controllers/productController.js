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
        let { 
            search, 
            page, 
            limit, 
            sortBy,
            minPrice,
            maxPrice,
            categories
        } = req.body 

        if(!page){
            page = 1
        }
        if(!limit){
            limit  = 10
        }

        // Build query object
        let query = {}
        
        // Text search
        if(search && search.trim()) {
            query.$text = {
                $search : search.trim()
            }
        }
        
        // Price range filter
        if(minPrice !== undefined || maxPrice !== undefined) {
            query.price = {}
            if(minPrice !== undefined && !isNaN(parseFloat(minPrice))) {
                query.price.$gte = parseFloat(minPrice)
            }
            if(maxPrice !== undefined && !isNaN(parseFloat(maxPrice))) {
                query.price.$lte = parseFloat(maxPrice)
            }
        }
        
        // Category filter
        if(categories && Array.isArray(categories) && categories.length > 0) {
            query.category = { $in: categories }
        }

        // Build sort object
        let sortQuery = { createdAt: -1 } // default sort
        
        switch(sortBy) {
            case 'price-low-high':
                sortQuery = { price: 1 }
                break
            case 'price-high-low':
                sortQuery = { price: -1 }
                break
            case 'name-az':
                sortQuery = { name: 1 }
                break
            case 'name-za':
                sortQuery = { name: -1 }
                break
            case 'newest':
                sortQuery = { createdAt: -1 }
                break
            case 'relevance':
                // For text search relevance, we use the text score
                if(search && search.trim()) {
                    sortQuery = { score: { $meta: 'textScore' } }
                }
                break
            default:
                sortQuery = { createdAt: -1 }
        }

        const skip = ( page - 1) * limit

        // Build aggregation pipeline for better performance and flexibility
        const pipeline = [
            { $match: query },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'category'
                }
            },
            {
                $lookup: {
                    from: 'subcategories',
                    localField: 'subCategory', 
                    foreignField: '_id',
                    as: 'subCategory'
                }
            }
        ]
        
        // Add text score projection if doing relevance sort
        if(sortBy === 'relevance' && search && search.trim()) {
            pipeline.unshift({ $addFields: { score: { $meta: 'textScore' } } })
        }
        
        pipeline.push(
            { $sort: sortQuery },
            { $skip: skip },
            { $limit: limit }
        )

        // Execute aggregation and count query in parallel
        const [data, dataCount] = await Promise.all([
            Product.aggregate(pipeline),
            Product.countDocuments(query)
        ])

        return res.json({
            message : "Product data",
            error : false,
            success : true,
            data : data,
            totalCount : dataCount,
            totalPage : Math.ceil(dataCount/limit),
            page : page,
            limit : limit,
            filters: {
                search: search || '',
                sortBy: sortBy || 'relevance',
                minPrice: minPrice,
                maxPrice: maxPrice,
                categories: categories || []
            }
        })

    } catch (error) {
        return res.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}
