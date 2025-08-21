import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoginScreen from './LoginScreen';
import MainApp from './MainApp';
import LoadingSpinner from './common/LoadingSpinner';

function AppGate() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return user ? <MainApp /> : <LoginScreen />;
}

export default AppGate;