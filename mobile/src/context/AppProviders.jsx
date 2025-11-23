import React from 'react';
import { AuthProvider } from './AuthContext';
import { ThemeProvider } from './ThemeContext';
import { DataProvider } from './DataContext';

export const AppProviders = ({ children }) => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <DataProvider>
          {children}
        </DataProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};
