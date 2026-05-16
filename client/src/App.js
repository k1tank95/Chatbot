import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import AuthPage from './components/AuthPage';
import MainLayout from './components/MainLayout';
import InstallPrompt from './components/InstallPrompt';

function AppContent() {
  const { user } = useAuth();
  return user ? <SocketProvider><MainLayout /></SocketProvider> : <AuthPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
      <InstallPrompt />
    </AuthProvider>
  );
}
