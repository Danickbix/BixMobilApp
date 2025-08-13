// Environment utility functions for browser compatibility

// Safe environment variable access
export const getEnvVar = (key: string, fallback: string = ''): string => {
  try {
    // Check if we're in a Node.js environment
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key] || fallback;
    }
    
    // Check if we're in a browser with webpack environment variables
    if (typeof window !== 'undefined' && (window as any).__env) {
      return (window as any).__env[key] || fallback;
    }
    
    // Fallback for other browser environments
    return fallback;
  } catch (error) {
    console.warn(`Failed to access environment variable ${key}:`, error);
    return fallback;
  }
};

// Check if we're running in a browser
export const isBrowser = (): boolean => {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
};

// Check if we're running in Node.js
export const isNode = (): boolean => {
  try {
    return typeof process !== 'undefined' && 
           process.versions != null && 
           process.versions.node != null;
  } catch {
    return false;
  }
};

// Safe localStorage access
export const getFromLocalStorage = (key: string, fallback: any = null) => {
  if (!isBrowser()) return fallback;
  
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (error) {
    console.warn(`Failed to get ${key} from localStorage:`, error);
    return fallback;
  }
};

export const setToLocalStorage = (key: string, value: any): boolean => {
  if (!isBrowser()) return false;
  
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`Failed to set ${key} to localStorage:`, error);
    return false;
  }
};

// Safe sessionStorage access  
export const getFromSessionStorage = (key: string, fallback: any = null) => {
  if (!isBrowser()) return fallback;
  
  try {
    const item = sessionStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (error) {
    console.warn(`Failed to get ${key} from sessionStorage:`, error);
    return fallback;
  }
};

export const setToSessionStorage = (key: string, value: any): boolean => {
  if (!isBrowser()) return false;
  
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`Failed to set ${key} to sessionStorage:`, error);
    return false;
  }
};

// Generate unique IDs (fallback for environments without crypto)
export const generateId = (): string => {
  if (isBrowser() && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  
  // Fallback implementation
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Safe JSON parsing
export const safeJsonParse = (str: string, fallback: any = null) => {
  try {
    return JSON.parse(str);
  } catch (error) {
    console.warn('Failed to parse JSON:', error);
    return fallback;
  }
};

// Feature detection
export const features = {
  localStorage: (() => {
    try {
      return isBrowser() && 'localStorage' in window && window.localStorage !== null;
    } catch {
      return false;
    }
  })(),
  
  sessionStorage: (() => {
    try {
      return isBrowser() && 'sessionStorage' in window && window.sessionStorage !== null;
    } catch {
      return false;
    }
  })(),
  
  indexedDB: (() => {
    try {
      return isBrowser() && 'indexedDB' in window && window.indexedDB !== null;
    } catch {
      return false;
    }
  })(),
  
  serviceWorker: (() => {
    try {
      return isBrowser() && 'serviceWorker' in navigator;
    } catch {
      return false;
    }
  })(),
  
  webBluetooth: (() => {
    try {
      return isBrowser() && 'bluetooth' in navigator;
    } catch {
      return false;
    }
  })(),
  
  notifications: (() => {
    try {
      return isBrowser() && 'Notification' in window;
    } catch {
      return false;
    }
  })()
};