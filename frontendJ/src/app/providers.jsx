import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { AppProvider } from '../context/AppContext';
import { WeatherProvider } from '../context/WeatherContext';
import { WeatherThemeProvider } from '../context/WeatherThemeContext';

export function AppProviders({ children }) {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <WeatherProvider>
            <WeatherThemeProvider>{children}</WeatherThemeProvider>
          </WeatherProvider>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default AppProviders;
