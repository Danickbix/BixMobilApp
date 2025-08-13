import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getAnalytics } from 'firebase/analytics';
import { config, isDevelopment } from '../config/environment';

// Initialize Firebase with your real project configuration
const app = initializeApp(config.firebase);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app, 'us-central1'); // Specify region for Cloud Functions

// Initialize Analytics with real project
export const analytics = typeof window !== 'undefined' && config.app.enableAnalytics
  ? getAnalytics(app)
  : null;

// Only connect to emulators in development mode (disabled for production)
if (isDevelopment() && config.app.enableEmulators) {
  try {
    // Only connect if we're in a local development environment
    if (typeof window !== 'undefined' && 
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      
      console.log('Connecting to Firebase emulators...');
      
      // Connect to Auth emulator
      if (!(auth as any)._delegate?._authDomain?.includes('localhost')) {
        connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
        console.log('Connected to Auth emulator');
      }
      
      // Connect to Firestore emulator
      if (!(db as any)._delegate?._databaseId?.projectId?.includes('localhost')) {
        connectFirestoreEmulator(db, 'localhost', 8080);
        console.log('Connected to Firestore emulator');
      }
      
      // Connect to Functions emulator
      if (!(functions as any)._delegate?._region?.includes('localhost')) {
        connectFunctionsEmulator(functions, "localhost", 5001);
        console.log('Connected to Functions emulator');
      }
    }
  } catch (error) {
    console.log('Firebase emulators not available, using production services');
  }
} else {
  console.log('Using production Firebase services for project: dulpton-point');
}

export default app;