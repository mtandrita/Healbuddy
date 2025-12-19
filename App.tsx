import React, { useState, useEffect } from 'react';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './Dashboard';
import Profile from './components/auth/Profile';
import { User } from './types';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<'login' | 'register' | 'dashboard'>('login');
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    // Check for logged in user
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
      setCurrentView('dashboard');
    }
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    setCurrentView('login');
    setShowProfile(false);
  };

  const handleUpdateUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
  };

  if (!currentUser) {
    if (currentView === 'register') {
      return <Register onNavigateToLogin={() => setCurrentView('login')} />;
    }
    return <Login onLogin={handleLogin} onNavigateToRegister={() => setCurrentView('register')} />;
  }

  return (
    <>
      <Dashboard 
        currentUser={currentUser} 
        onProfileClick={() => setShowProfile(true)} 
      />
      
      {showProfile && (
        <Profile 
          currentUser={currentUser} 
          onUpdateUser={handleUpdateUser} 
          onLogout={handleLogout} 
          onClose={() => setShowProfile(false)} 
        />
      )}
    </>
  );
};

export default App;
