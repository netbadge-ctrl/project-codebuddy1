import React from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import AppGate from './components/AppGate';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <AppGate />
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;