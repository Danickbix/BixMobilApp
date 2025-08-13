// Environment configuration for Bix Mobil Vest
// Updated with real Firebase project credentials

export const config = {
  // Firebase Configuration - Real project: dulpton-point
  firebase: {
    apiKey: "AIzaSyCwKYdDanFqVne8Voo6bEPnWGUMRWOH4No",
    authDomain: "dulpton-point.firebaseapp.com",
    projectId: "dulpton-point",
    storageBucket: "dulpton-point.firebasestorage.app",
    messagingSenderId: "645236519380",
    appId: "1:645236519380:web:b952c1710f494fa01b2641",
    measurementId: "G-8063XVPWEN"
  },

  // API Configuration
  api: {
    baseUrl: "https://us-central1-dulpton-point.cloudfunctions.net", // Firebase Functions URL
    timeout: 30000 // 30 seconds
  },

  // Payment Gateway Configuration
  payments: {
    paystack: {
      publicKey: "pk_test_xxxxxxxxxx", // Replace with your Paystack public key
    },
    flutterwave: {
      publicKey: "FLWPUBK_TEST-xxxxxxxxxx", // Replace with your Flutterwave public key
    }
  },

  // App Configuration
  app: {
    name: "Bix Mobil Vest",
    version: "1.0.0",
    environment: "production", // Using production Firebase project
    enableAnalytics: true, // Enable since we have measurementId
    enableEmulators: false, // Disable emulators for production project
    minWalletTopup: 100, // Minimum wallet top-up amount in Naira
    commissionRate: 0.025, // 2.5% commission rate
  },

  // Feature Flags
  features: {
    phoneAuth: true,
    emailAuth: true,
    bluetoothPrinting: true,
    offlineMode: true,
    pushNotifications: true,
    biometricAuth: false, // For future implementation
  }
};

// Helper function to get configuration values
export const getConfig = (path: string) => {
  const keys = path.split('.');
  let value: any = config;
  
  for (const key of keys) {
    value = value?.[key];
    if (value === undefined) break;
  }
  
  return value;
};

// Environment-specific settings
export const isProduction = () => config.app.environment === 'production';
export const isDevelopment = () => config.app.environment === 'development';
export const isStaging = () => config.app.environment === 'staging';