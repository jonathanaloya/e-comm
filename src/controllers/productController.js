import Product from '../models/productModel.js';

// Get all products
// Get all products
export async function getProducts(req, res) {
  try {
    const { name, description, price } = req.body;

    if(!name || !description || !price) {
      return res.status(400).json({ 
        message: 'All fields are required',
        error: true,
        success: false 
      });
    }

    const products = await Product.findOne();
    
    // Fetch all products from MongoDB
    return res.status(200).json(products);  // Send products as a JSON response
  } catch (error) {
    return res.status(500).json({
      message: 'Error fetching products',
      error: true,
      success: false
    });
  }
};


// Add a new product
export async function addProduct(req, res) {
  try {
    const { name, description, price } = req.body;

    // Validate required fields
    if (!name || !description || !price) {
      return res.status(400).json({ 
        message: 'All fields are required', 
        error: true, 
        success: false 
      });
    }

    // Validate price is a number
    if (isNaN(price) || price <= 0) {
      return res.status(400).json({ 
        message: 'Price must be a positive number', 
        error: true, 
        success: false 
      });
    }

    // Create and save the new product
    const newProduct = new Product({ name, description, price });
    await newProduct.save();

    return res.status(201).json({ 
      message: 'Product added successfully', 
      success: true, 
      product: newProduct 
    });

  } catch (error) {
    return res.status(500).json({ 
      message: 'Error adding product', 
      error: true, 
      success: false,
      details: error.message 
    });
  }
}

export default { getProducts, addProduct };
