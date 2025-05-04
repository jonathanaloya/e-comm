import React, { useState } from 'react';
import ProductList from './components/ProductList';
import LoginForm from './components/LoginForm';

function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  return (
    <div className="App">
      <h1>Welcome to the E-Commerce Platform</h1>
      {user ? (
        <div>
          <p>Welcome, {user.name}</p>
          <ProductList />
        </div>
      ) : (
        <LoginForm onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;
