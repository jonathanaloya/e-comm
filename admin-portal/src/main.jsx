import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store/store.js'
import router from './router/index.jsx'
import './index.css'
import { initializeAuth } from './store/authSlice'

// Bootstrap auth synchronously (it may do async validation later)
store.dispatch(initializeAuth())

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>,
)