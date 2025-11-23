import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  // Mock user for now
  const [user, setUser] = useState({
    id: '1',
    name: 'Demo User',
    email: 'demo@example.com',
    role: 'designer'
  });
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const login = async (email, password) => {
    // Mock login logic
    setUser({
      id: '1',
      name: 'Demo User',
      email: email,
      role: 'designer'
    });
    setIsAuthenticated(true);
  };

  const logout = async () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    isAuthenticated,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
