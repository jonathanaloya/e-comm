import Category from "../models/categoryModel.js";
import Product from "../models/productModel.js";
import subCategory from "../models/subCategoryModel.js";

export const AddCategory = async (req, res) => {
    try {
        const { name, Image } = req.body;

        if (!name || !Image) {
            return res.status(400).json({ 
                message: "All fields are required", 
                error: true, 
                success: false 
            });
        }
        
        const newCategory = new Category({ 
            name, 
            Image 
        });
        const saveCategory = await newCategory.save()

        if (!saveCategory) {
            return res.status(400).json({ 
                message: "Category not added", 
                error: true, 
                success: false 
            });
        }
        return res.status(201).json({ 
            message: "Category added successfully", 
            success: true, 
            data: saveCategory 
        });
    } catch (error) {
        return res.status(500).json({
             message: error.message || error,
             error : true,
             success : false

        });
    }
};

export const getCategory = async (req, res) => {
    try {
        const data = await Category.find().sort({ createdAt: -1 });

        if (!data) {
            return res.status(400).json({ 
                message: "Category not found", 
                error: true, 
                success: false 
            });
        }
        return res.status(200).json({
            message: "Category fetched successfully",
            error: false,
            success: true,
            data: data
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error : true,
            success : false

        });
    }
};

export const updateCategory = async (req, res) => {
    try {
        const { _id, name, Image } = req.body;

        const update = await Category.updateOne({
            _id: _id
        }, {
            name,
            Image
        })

        return res.status(200).json({ 
            message: "Category updated successfully", 
            success: true, 
            data: update 
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error : true,
            success : false

        });
    }
};

export const deleteCategory = async (req, res) => {
    try {
        const { _id } = req.body;

        const checkSubCategory = await subCategory.find({
            category : {
                "$in" : [_id]
            }
        }).countDocuments()

        const checkProduct = await Product.find({
            category : {
                "$in" : [_id]
            }
        }).countDocuments()

        if (checkSubCategory > 0 || checkProduct > 0) {
            return res.status(400).json({ 
                message: "Category has subcategory or product", 
                error: true, 
                success: false 
            });
        }

        const deleteCategory = await Category.deleteOne({
            _id: _id
        })

        return res.status(200).json({ 
            message: "Category deleted successfully", 
            error: false,
            success: true, 
            data: deleteCategory 
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error : true,
            success : false

        });
    }
};