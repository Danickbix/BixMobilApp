import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { authService, UserProfile } from './auth';
import { databaseService } from './database';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (email: string, password: string, profile: Partial<UserProfile>) => Promise<User>;
  sendOTP: (phoneNumber: string) => Promise<any>;
  verifyOTP: (confirmationResult: any, otp: string) => Promise<User>;
  signOut: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(async (user) => {
      console.log('Auth state changed:', user ? { uid: user.uid, email: user.email } : null);
      
      setUser(user);
      setError(null);
      
      if (user) {
        try {
          // Fetch user profile from Firestore
          console.log('Fetching user profile for:', user.uid);
          let profile = await authService.getUserProfile(user.uid);
          
          // If profile doesn't exist, create a default one
          if (!profile) {
            console.log('User profile not found, creating default profile...');
            profile = await createDefaultProfile(user);
          }
          
          console.log('User profile loaded:', profile);
          setUserProfile(profile);
          
          // Set up real-time listener for user profile updates
          const unsubscribeProfile = databaseService.onUserProfileChange(
            user.uid, 
            (updatedProfile) => {
              console.log('Profile updated:', updatedProfile);
              setUserProfile(updatedProfile);
            }
          );
          
          return () => unsubscribeProfile();
        } catch (error) {
          console.error('Error loading user profile:', error);
          setError('Failed to load user profile');
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Create a default profile if none exists
  const createDefaultProfile = async (user: User): Promise<UserProfile> => {
    const defaultProfile: UserProfile = {
      uid: user.uid,
      email: user.email || undefined,
      phoneNumber: user.phoneNumber || undefined,
      displayName: user.displayName || undefined,
      walletBalance: 0,
      commissionRate: 0.025, // 2.5%
      isVerified: false,
      createdAt: new Date(),
      lastLogin: new Date()
    };

    try {
      // Save the default profile to Firestore
      await databaseService.updateUserProfile(user.uid, defaultProfile);
      console.log('Default profile created successfully');
      return defaultProfile;
    } catch (error) {
      console.error('Error creating default profile:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const user = await authService.signInWithEmail(email, password);
      return user;
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, profile: Partial<UserProfile>) => {
    setLoading(true);
    setError(null);
    try {
      const user = await authService.signUpWithEmail(email, password, profile);
      // Profile will be created by the auth service, but let's ensure it's loaded
      await refreshUserProfile();
      return user;
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const sendOTP = async (phoneNumber: string) => {
    setError(null);
    try {
      return await authService.sendOTP(phoneNumber);
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  const verifyOTP = async (confirmationResult: any, otp: string) => {
    setLoading(true);
    setError(null);
    try {
      const user = await authService.verifyOTP(confirmationResult, otp);
      // Profile will be created by the auth service, but let's ensure it's loaded
      await refreshUserProfile();
      return user;
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    setError(null);
    try {
      await authService.signOut();
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const refreshUserProfile = async () => {
    if (user) {
      try {
        console.log('Refreshing user profile...');
        let profile = await authService.getUserProfile(user.uid);
        
        // If profile still doesn't exist, create it
        if (!profile) {
          console.log('Creating missing profile during refresh...');
          profile = await createDefaultProfile(user);
        }
        
        setUserProfile(profile);
        setError(null);
      } catch (error: any) {
        console.error('Error refreshing user profile:', error);
        setError('Failed to refresh profile');
      }
    }
  };

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    error,
    signIn,
    signUp,
    sendOTP,
    verifyOTP,
    signOut,
    refreshUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};