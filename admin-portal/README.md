# Fresh Katale Admin Portal

A separate admin portal for managing the Fresh Katale e-commerce platform.

## Features

- **Dashboard**: Overview of orders, users, and revenue
- **Order Management**: View, search, and update order status
- **User Management**: View all registered users
- **Product Management**: Manage products and inventory
- **Real-time Updates**: Live order status tracking

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Admin Access

- Only users with `ADMIN` role can access the portal
- Uses the same backend API as the main e-commerce site
- Separate authentication system for admin users

## Deployment

- Can be deployed separately from the main e-commerce site
- Connects to the same backend API
- Recommended subdomain: `admin.freshkatale.com`

## Environment Variables

Create a `.env` file in the admin portal root:
```bash
VITE_API_BASE_URL=https://your-backend-api.com
```

## Environment

- Development: `http://localhost:3001`
- Production: Set `VITE_API_BASE_URL` in deployment environment