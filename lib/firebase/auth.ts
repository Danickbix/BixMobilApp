import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  ConfirmationResult,
  signOut,
  onAuthStateChanged,
  User,
  updateProfile,
  PhoneAuthProvider,
  signInWithCredential
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';
import { config as appConfig } from '../config/environment';

export interface UserProfile {
  uid: string;
  email?: string;
  phoneNumber?: string;
  displayName?: string;
  businessName?: string;
  businessType?: 'cyber_cafe' | 'phone_shop' | 'retail_store' | 'other';
  location?: {
    state: string;
    city: string;
    address?: string;
  };
  walletBalance: number;
  commissionRate: number;
  isVerified: boolean;
  createdAt: any;
  lastLogin: any;
}

class AuthService {
  private recaptchaVerifier: RecaptchaVerifier | null = null;

  // Initialize reCAPTCHA for phone authentication
  initializeRecaptcha(containerId: string = 'recaptcha-container') {
    if (!appConfig.features.phoneAuth) {
      throw new Error('Phone authentication is disabled');
    }

    if (!this.recaptchaVerifier && typeof window !== 'undefined') {
      try {
        this.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
          size: 'invisible',
          callback: () => {
            console.log('reCAPTCHA solved');
          },
          'expired-callback': () => {
            console.log('reCAPTCHA expired');
            this.recaptchaVerifier = null;
          }
        });
      } catch (error) {
        console.error('Failed to initialize reCAPTCHA:', error);
        throw new Error('Failed to initialize phone authentication');
      }
    }
    return this.recaptchaVerifier;
  }

  // Sign up with email and password
  async signUpWithEmail(email: string, password: string, profile: Partial<UserProfile>) {
    if (!appConfig.features.emailAuth) {
      throw new Error('Email authentication is disabled');
    }

    try {
      console.log('🔐 Starting email sign up for:', email);
      
      // Validate input
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('✅ Firebase user created:', { uid: user.uid, email: user.email });

      // Update display name if provided
      if (profile.displayName) {
        try {
          await updateProfile(user, { displayName: profile.displayName });
          console.log('✅ Display name updated:', profile.displayName);
        } catch (error) {
          console.warn('⚠️ Failed to update display name:', error);
        }
      }

      // Create comprehensive user profile in Firestore
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email || undefined,
        displayName: profile.displayName || user.displayName || undefined,
        businessName: profile.businessName,
        businessType: profile.businessType || 'other',
        location: profile.location,
        walletBalance: 0,
        commissionRate: appConfig.app.commissionRate,
        isVerified: false,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      };

      console.log('📝 Creating user profile in Firestore:', {
        uid: userProfile.uid,
        email: userProfile.email,
        displayName: userProfile.displayName
      });
      
      await this.createUserProfile(user.uid, userProfile);
      console.log('✅ User profile created successfully');

      return user;
    } catch (error: any) {
      console.error('❌ Sign up error:', {
        code: error.code,
        message: error.message,
        email: email
      });
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  // Sign in with email and password
  async signInWithEmail(email: string, password: string) {
    if (!appConfig.features.emailAuth) {
      throw new Error('Email authentication is disabled');
    }

    try {
      console.log('🔐 Attempting email sign in for:', email);
      
      // Validate input
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Sign in successful for user:', userCredential.user.uid);
      
      await this.updateLastLogin(userCredential.user.uid);
      console.log('✅ Last login updated');
      
      return userCredential.user;
    } catch (error: any) {
      console.error('❌ Sign in error:', {
        code: error.code,
        message: error.message,
        email: email
      });
      
      // Log specific error cases for debugging
      if (error.code === 'auth/invalid-credential') {
        console.error('🚫 Invalid credentials - user may not exist or password is wrong');
      } else if (error.code === 'auth/user-not-found') {
        console.error('🚫 User not found - account may not exist');
      } else if (error.code === 'auth/wrong-password') {
        console.error('🚫 Wrong password provided');
      }
      
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  // Send OTP to phone number
  async sendOTP(phoneNumber: string): Promise<ConfirmationResult> {
    if (!appConfig.features.phoneAuth) {
      throw new Error('Phone authentication is disabled');
    }

    try {
      // Ensure phone number is in international format
      const formattedPhone = phoneNumber.startsWith('+234') 
        ? phoneNumber 
        : `+234${phoneNumber.replace(/^0/, '')}`;

      console.log('📱 Sending OTP to:', formattedPhone);

      if (!this.recaptchaVerifier) {
        this.initializeRecaptcha();
      }

      const confirmationResult = await signInWithPhoneNumber(
        auth, 
        formattedPhone, 
        this.recaptchaVerifier!
      );
      
      console.log('✅ OTP sent successfully');
      return confirmationResult;
    } catch (error: any) {
      console.error('❌ Send OTP error:', error);
      this.recaptchaVerifier = null; // Reset on error
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  // Verify OTP and sign in
  async verifyOTP(confirmationResult: ConfirmationResult, otp: string) {
    try {
      console.log('📱 Verifying OTP:', otp.length, 'digits');
      const userCredential = await confirmationResult.confirm(otp);
      const user = userCredential.user;
      console.log('✅ OTP verified for user:', user.uid);

      // Check if user profile exists, create if not
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        console.log('📝 Creating profile for phone user');
        const userProfile: UserProfile = {
          uid: user.uid,
          phoneNumber: user.phoneNumber || undefined,
          walletBalance: 0,
          commissionRate: appConfig.app.commissionRate,
          isVerified: false,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp()
        };
        await this.createUserProfile(user.uid, userProfile);
        console.log('✅ Phone user profile created');
      } else {
        await this.updateLastLogin(user.uid);
        console.log('✅ Existing user last login updated');
      }

      return user;
    } catch (error: any) {
      console.error('❌ OTP verification error:', error);
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  // Sign out
  async signOut() {
    try {
      console.log('🚪 Signing out user');
      await signOut(auth);
      this.recaptchaVerifier = null;
      console.log('✅ Sign out successful');
    } catch (error: any) {
      console.error('❌ Sign out error:', error);
      throw new Error('Failed to sign out');
    }
  }

  // Listen to authentication state changes
  onAuthStateChanged(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('👤 Auth state: User signed in -', user.uid);
      } else {
        console.log('👤 Auth state: No user');
      }
      callback(user);
    });
  }

  // Create user profile in Firestore with retry logic
  private async createUserProfile(uid: string, profile: Partial<UserProfile>, retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        console.log(`📝 Creating user profile attempt ${i + 1}/${retries}`);
        await setDoc(doc(db, 'users', uid), profile);
        console.log('✅ User profile created in Firestore');
        return;
      } catch (error) {
        console.error(`❌ Failed to create profile (attempt ${i + 1}):`, error);
        if (i === retries - 1) {
          console.error('❌ All profile creation attempts failed');
          throw error;
        }
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }

  // Update last login timestamp
  private async updateLastLogin(uid: string) {
    try {
      await setDoc(doc(db, 'users', uid), { 
        lastLogin: serverTimestamp() 
      }, { merge: true });
      console.log('✅ Last login timestamp updated');
    } catch (error) {
      console.warn('⚠️ Failed to update last login:', error);
    }
  }

  // Get user profile from Firestore with retry logic
  async getUserProfile(uid: string, retries = 3): Promise<UserProfile | null> {
    for (let i = 0; i < retries; i++) {
      try {
        console.log(`📖 Fetching user profile attempt ${i + 1}/${retries}`);
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
          const profile = userDoc.data() as UserProfile;
          console.log('✅ User profile fetched:', {
            uid: profile.uid,
            email: profile.email,
            walletBalance: profile.walletBalance
          });
          return profile;
        } else {
          console.log('❌ User profile document does not exist');
          return null;
        }
      } catch (error) {
        console.error(`❌ Failed to fetch profile (attempt ${i + 1}):`, error);
        if (i === retries - 1) {
          console.error('❌ All profile fetch attempts failed');
          return null;
        }
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
    return null;
  }

  // Convert Firebase error codes to user-friendly messages
  private getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No account found with this email address. Please check your email or create a new account.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again or reset your password.';
      case 'auth/invalid-credential':
        return 'Invalid email or password. Please check your credentials and try again.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists. Please try signing in instead.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters long.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later or reset your password.';
      case 'auth/invalid-phone-number':
        return 'Invalid phone number format. Please use a valid Nigerian phone number.';
      case 'auth/quota-exceeded':
        return 'SMS quota exceeded. Please try again later.';
      case 'auth/invalid-verification-code':
        return 'Invalid verification code. Please check the code and try again.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your internet connection and try again.';
      case 'auth/operation-not-allowed':
        return 'This sign-in method is not enabled. Please contact support.';
      default:
        console.error('🚨 Unhandled auth error:', errorCode);
        return 'An unexpected error occurred. Please try again.';
    }
  }
}

export const authService = new AuthService();