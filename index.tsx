import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider, useAuth } from './context/auth-context';
import { ThemeProvider } from './context/theme-context';
import { LoginScreen } from './components/LoginScreen';
import { LoadingSpinner } from './components/LoadingSpinner';

const AppGate: React.FC = () => {
    const { user, logout, isLoading } = useAuth();

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return user ? <App currentUser={user} onLogout={logout} /> : <LoginScreen />;
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <AppGate />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);