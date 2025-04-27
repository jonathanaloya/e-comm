import Category from "../models/categoryModel.js";

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
        const data = await Category.find()

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

