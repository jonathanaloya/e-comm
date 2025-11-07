// Mock data for testing admin portal without backend
export const mockOrders = [
  {
    _id: '1',
    orderId: 'ORD-001',
    userId: { name: 'John Doe', email: 'john@example.com', mobile: '+256700123456' },
    product_details: { name: 'Fresh Tomatoes' },
    quantity: 2,
    totalAmt: 15000,
    order_status: 'pending',
    payment_status: 'paid',
    createdAt: new Date().toISOString(),
    delivery_address: {
      address_line: '123 Main Street',
      city: 'Kampala',
      state: 'Central',
      country: 'Uganda'
    }
  },
  {
    _id: '2',
    orderId: 'ORD-002',
    userId: { name: 'Jane Smith', email: 'jane@example.com', mobile: '+256700654321' },
    product_details: { name: 'Organic Carrots' },
    quantity: 1,
    totalAmt: 8000,
    order_status: 'delivered',
    payment_status: 'paid',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    delivery_address: {
      address_line: '456 Oak Avenue',
      city: 'Entebbe',
      state: 'Central',
      country: 'Uganda'
    }
  }
]

export const mockUsers = [
  {
    _id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    mobile: '+256700123456',
    role: 'USER',
    verify_email: true,
    createdAt: new Date(Date.now() - 2592000000).toISOString()
  },
  {
    _id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    mobile: '+256700654321',
    role: 'USER',
    verify_email: true,
    createdAt: new Date(Date.now() - 1296000000).toISOString()
  }
]

export const mockProducts = [
  {
    _id: '1',
    name: 'Fresh Tomatoes',
    price: 7500,
    stock: 50,
    publish: true,
    image: ['/logo.jpg'],
    category: [{ name: 'Vegetables' }],
    subCategory: [{ name: 'Fresh Produce' }]
  },
  {
    _id: '2',
    name: 'Organic Carrots',
    price: 8000,
    stock: 30,
    publish: true,
    image: ['/logo.jpg'],
    category: [{ name: 'Vegetables' }],
    subCategory: [{ name: 'Organic' }]
  }
]