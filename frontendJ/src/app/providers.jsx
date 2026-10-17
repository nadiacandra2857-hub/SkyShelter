import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { AppProvider } from '../context/AppContext';

export function AppProviders({ children }) {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>{children}</AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default AppProviders;
