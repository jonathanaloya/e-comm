import Product from "../models/productModel.js";
import Category from "../models/categoryModel.js";
import SubCategory from "../models/subCategoryModel.js";
import mongoose from "mongoose";

// Get all products with admin details
export async function getAllProducts(request, response) {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search, 
      category, 
      subCategory,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = request.query;

    // Build filter query
    let filter = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) filter.category = category;
    if (subCategory) filter.subCategory = subCategory;
    if (status) filter.publish = status === 'published';

    const skip = (page - 1) * limit;
    const sortObj = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const products = await Product.find(filter)
      .populate('category', 'name')
      .populate('subCategory', 'name')
      .sort(sortObj)
      .limit(parseInt(limit))
      .skip(skip);

    const totalProducts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / limit);

    return response.json({
      message: "Products retrieved successfully",
      data: {
        products,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalProducts,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      },
      error: false,
      success: true
    });

  } catch (error) {
    console.error('Get all products error:', error);
    return response.status(500).json({
      message: error.message || "Failed to get products",
      error: true,
      success: false
    });
  }
}

// Create new product
export async function createProduct(request, response) {
  try {
    const {
      name,
      description,
      image,
      category,
      subCategory,
      unit,
      stock,
      price,
      discount,
      publish = false
    } = request.body;

    // Validate required fields
    if (!name || !price || !category) {
      return response.status(400).json({
        message: "Name, price, and category are required",
        error: true,
        success: false
      });
    }

    // Check if category and subCategory exist
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return response.status(400).json({
        message: "Invalid category",
        error: true,
        success: false
      });
    }

    if (subCategory) {
      const subCategoryExists = await SubCategory.findById(subCategory);
      if (!subCategoryExists) {
        return response.status(400).json({
          message: "Invalid subcategory",
          error: true,
          success: false
        });
      }
    }

    const newProduct = new Product({
      name,
      description: description || '',
      image: Array.isArray(image) ? image : [image].filter(Boolean),
      category,
      subCategory: subCategory || null,
      unit: unit || 'piece',
      stock: stock || 0,
      price,
      discount: discount || 0,
      publish
    });

    const savedProduct = await newProduct.save();
    
    // Populate the response
    const populatedProduct = await Product.findById(savedProduct._id)
      .populate('category', 'name')
      .populate('subCategory', 'name');

    return response.status(201).json({
      message: "Product created successfully",
      data: populatedProduct,
      error: false,
      success: true
    });

  } catch (error) {
    console.error('Create product error:', error);
    return response.status(500).json({
      message: error.message || "Failed to create product",
      error: true,
      success: false
    });
  }
}

// Update product
export async function updateProduct(request, response) {
  try {
    const { productId } = request.params;
    const updateData = request.body;

    // Validate product exists
    const existingProduct = await Product.findById(productId);
    if (!existingProduct) {
      return response.status(404).json({
        message: "Product not found",
        error: true,
        success: false
      });
    }

    // Validate category if being updated
    if (updateData.category) {
      const categoryExists = await Category.findById(updateData.category);
      if (!categoryExists) {
        return response.status(400).json({
          message: "Invalid category",
          error: true,
          success: false
        });
      }
    }

    // Validate subCategory if being updated
    if (updateData.subCategory) {
      const subCategoryExists = await SubCategory.findById(updateData.subCategory);
      if (!subCategoryExists) {
        return response.status(400).json({
          message: "Invalid subcategory",
          error: true,
          success: false
        });
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { $set: updateData },
      { new: true }
    ).populate('category', 'name')
     .populate('subCategory', 'name');

    return response.json({
      message: "Product updated successfully",
      data: updatedProduct,
      error: false,
      success: true
    });

  } catch (error) {
    console.error('Update product error:', error);
    return response.status(500).json({
      message: error.message || "Failed to update product",
      error: true,
      success: false
    });
  }
}

// Delete product
export async function deleteProduct(request, response) {
  try {
    const { productId } = request.params;

    const deletedProduct = await Product.findByIdAndDelete(productId);
    
    if (!deletedProduct) {
      return response.status(404).json({
        message: "Product not found",
        error: true,
        success: false
      });
    }

    return response.json({
      message: "Product deleted successfully",
      data: deletedProduct,
      error: false,
      success: true
    });

  } catch (error) {
    console.error('Delete product error:', error);
    return response.status(500).json({
      message: error.message || "Failed to delete product",
      error: true,
      success: false
    });
  }
}

// Get single product details
export async function getProductDetails(request, response) {
  try {
    const { productId } = request.params;

    const product = await Product.findById(productId)
      .populate('category', 'name')
      .populate('subCategory', 'name');

    if (!product) {
      return response.status(404).json({
        message: "Product not found",
        error: true,
        success: false
      });
    }

    return response.json({
      message: "Product details retrieved successfully",
      data: product,
      error: false,
      success: true
    });

  } catch (error) {
    console.error('Get product details error:', error);
    return response.status(500).json({
      message: error.message || "Failed to get product details",
      error: true,
      success: false
    });
  }
}

// Update product stock
export async function updateProductStock(request, response) {
  try {
    const { productId } = request.params;
    const { stock, operation = 'set' } = request.body; // operation: 'set', 'add', 'subtract'

    const product = await Product.findById(productId);
    if (!product) {
      return response.status(404).json({
        message: "Product not found",
        error: true,
        success: false
      });
    }

    let newStock;
    switch (operation) {
      case 'add':
        newStock = product.stock + parseInt(stock);
        break;
      case 'subtract':
        newStock = Math.max(0, product.stock - parseInt(stock));
        break;
      default: // 'set'
        newStock = parseInt(stock);
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { stock: newStock },
      { new: true }
    ).populate('category', 'name')
     .populate('subCategory', 'name');

    return response.json({
      message: "Product stock updated successfully",
      data: updatedProduct,
      error: false,
      success: true
    });

  } catch (error) {
    console.error('Update product stock error:', error);
    return response.status(500).json({
      message: error.message || "Failed to update product stock",
      error: true,
      success: false
    });
  }
}

// Get inventory report
export async function getInventoryReport(request, response) {
  try {
    const { lowStockThreshold = 10 } = request.query;

    const [
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      totalStockValue
    ] = await Promise.all([
      Product.countDocuments({ publish: true }),
      Product.find({ 
        stock: { $lte: parseInt(lowStockThreshold), $gt: 0 },
        publish: true 
      }).populate('category', 'name'),
      Product.find({ 
        stock: 0,
        publish: true 
      }).populate('category', 'name'),
      Product.aggregate([
        { $match: { publish: true } },
        { 
          $group: { 
            _id: null, 
            totalValue: { $sum: { $multiply: ['$stock', '$price'] } }
          }
        }
      ])
    ]);

    const inventoryReport = {
      summary: {
        totalProducts,
        lowStockCount: lowStockProducts.length,
        outOfStockCount: outOfStockProducts.length,
        totalStockValue: totalStockValue[0]?.totalValue || 0
      },
      lowStockProducts,
      outOfStockProducts
    };

    return response.json({
      message: "Inventory report retrieved successfully",
      data: inventoryReport,
      error: false,
      success: true
    });

  } catch (error) {
    console.error('Get inventory report error:', error);
    return response.status(500).json({
      message: error.message || "Failed to get inventory report",
      error: true,
      success: false
    });
  }
}