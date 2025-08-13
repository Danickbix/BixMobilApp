import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '../lib/firebase/AuthContext';
import { AuthFlow } from './AuthFlow';
import { Dashboard } from './Dashboard';
import { SalesPage } from './SalesPage';
import { WalletPage } from './WalletPage';
import { ProfilePage } from './ProfilePage';
import { Home, ShoppingBag, Wallet, User } from 'lucide-react';
import { Toaster } from './ui/sonner';
import { Button } from './ui/button';

// Main app content that uses auth context
function AppContent() {
  const { user, userProfile, loading, refreshUserProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'home' | 'sales' | 'wallet' | 'profile'>('home');
  const [profileRetryCount, setProfileRetryCount] = useState(0);

  // Debug logging
  useEffect(() => {
    console.log('Auth State Debug:', {
      user: user ? { uid: user.uid, email: user.email, phoneNumber: user.phoneNumber } : null,
      userProfile: userProfile ? { uid: userProfile.uid, walletBalance: userProfile.walletBalance } : null,
      loading,
      profileRetryCount
    });
  }, [user, userProfile, loading, profileRetryCount]);

  // Retry profile loading if user exists but profile doesn't
  useEffect(() => {
    if (user && !userProfile && !loading && profileRetryCount < 3) {
      console.log('Retrying user profile fetch...');
      const timer = setTimeout(() => {
        refreshUserProfile();
        setProfileRetryCount(prev => prev + 1);
      }, 2000); // Wait 2 seconds before retry

      return () => clearTimeout(timer);
    }
  }, [user, userProfile, loading, profileRetryCount, refreshUserProfile]);

  // Global loading state
  if (loading) {
    return (
      <div className="mobile-container flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your account...</p>
          <p className="text-xs text-muted-foreground mt-2">
            {user ? 'Setting up your profile...' : 'Checking authentication...'}
          </p>
        </div>
      </div>
    );
  }

  // No user - show auth flow
  if (!user) {
    return <AuthFlow />;
  }

  // User exists but profile is missing or still loading
  if (!userProfile) {
    return (
      <div className="mobile-container flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="animate-pulse rounded-full h-16 w-16 bg-primary/20 mx-auto mb-4 flex items-center justify-center">
            <User className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-lg font-semibold mb-2">Setting up your account</h2>
          <p className="text-muted-foreground mb-4">
            We're preparing your Bix Mobil Vest experience...
          </p>
          
          {profileRetryCount > 0 && (
            <p className="text-xs text-muted-foreground mb-4">
              Attempt {profileRetryCount + 1} of 3
            </p>
          )}

          <Button 
            onClick={() => {
              setProfileRetryCount(0);
              refreshUserProfile();
            }}
            variant="outline"
            size="sm"
          >
            Retry
          </Button>

          {profileRetryCount >= 2 && (
            <div className="mt-4 p-3 bg-muted rounded-lg text-left">
              <p className="text-xs font-medium mb-1">Debug Info:</p>
              <p className="text-xs text-muted-foreground">
                User ID: {user.uid}<br/>
                Email: {user.email || 'None'}<br/>
                Phone: {user.phoneNumber || 'None'}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'home':
        return <Dashboard />;
      case 'sales':
        return <SalesPage />;
      case 'wallet':
        return <WalletPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <Dashboard />;
    }
  };

  const tabs = [
    { id: 'home' as const, label: 'Home', icon: Home },
    { id: 'sales' as const, label: 'Sales', icon: ShoppingBag },
    { id: 'wallet' as const, label: 'Wallet', icon: Wallet },
    { id: 'profile' as const, label: 'Profile', icon: User },
  ];

  return (
    <div className="mobile-container flex flex-col h-screen">
      {/* Header */}
      <div className="safe-area-top bg-primary px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white font-bold">Bix Mobil Vest</h1>
            <p className="text-blue-100 text-sm">
              Welcome, {userProfile.displayName || userProfile.businessName || 'User'}
            </p>
          </div>
          <div className="bg-white/20 px-3 py-1 rounded-full">
            <p className="text-white text-sm font-medium">
              ₦{userProfile.walletBalance?.toLocaleString() || '0.00'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {renderActiveTab()}
      </div>

      {/* Bottom Navigation */}
      <div className="bg-white border-t border-gray-200 safe-area-bottom">
        <div className="flex">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 px-2 flex flex-col items-center space-y-1 transition-colors ${
                  isActive 
                    ? 'text-primary bg-primary/5' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <IconComponent size={20} />
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Add reCAPTCHA container for phone auth */}
      <div id="recaptcha-container"></div>
    </div>
  );
}

export function BixMobilApp() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster position="top-center" richColors />
    </AuthProvider>
  );
}