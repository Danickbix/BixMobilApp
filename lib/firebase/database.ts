import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp,
  increment,
  writeBatch,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from './config';
import { RechargeCard, TransactionHistory, UserProfile } from '../types';

export interface WalletTransaction {
  id?: string;
  userId: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  reference?: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: any;
  metadata?: Record<string, any>;
}

export interface RechargeCardInventory {
  id?: string;
  userId: string;
  network: 'MTN' | 'GLO' | 'AIRTEL' | '9MOBILE';
  denomination: number;
  pins: Array<{
    pin: string;
    serial: string;
    printed: boolean;
    soldAt?: any;
  }>;
  purchasedAt: any;
  totalCards: number;
  remainingCards: number;
  costPrice: number;
  sellingPrice: number;
}

class DatabaseService {
  // User Profile Operations with enhanced error handling
  async updateUserProfile(uid: string, updates: Partial<UserProfile>, retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        console.log(`Updating user profile (attempt ${i + 1}):`, updates);
        await updateDoc(doc(db, 'users', uid), {
          ...updates,
          updatedAt: serverTimestamp()
        });
        console.log('User profile updated successfully');
        return;
      } catch (error) {
        console.error(`Failed to update user profile (attempt ${i + 1}):`, error);
        if (i === retries - 1) {
          console.error('All attempts to update user profile failed');
          throw error;
        }
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  async getUserProfile(uid: string, retries = 3): Promise<UserProfile | null> {
    for (let i = 0; i < retries; i++) {
      try {
        console.log(`Getting user profile (attempt ${i + 1})`);
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
          const profile = userDoc.data() as UserProfile;
          console.log('User profile retrieved successfully');
          return profile;
        } else {
          console.log('User profile does not exist');
          return null;
        }
      } catch (error) {
        console.error(`Failed to get user profile (attempt ${i + 1}):`, error);
        if (i === retries - 1) {
          console.error('All attempts to get user profile failed');
          return null;
        }
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    return null;
  }

  // Create user profile with proper error handling
  async createUserProfile(uid: string, profile: UserProfile, retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        console.log(`Creating user profile (attempt ${i + 1}):`, profile);
        await setDoc(doc(db, 'users', uid), profile);
        console.log('User profile created successfully');
        return;
      } catch (error) {
        console.error(`Failed to create user profile (attempt ${i + 1}):`, error);
        if (i === retries - 1) {
          console.error('All attempts to create user profile failed');
          throw error;
        }
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  // Wallet Operations
  async addWalletTransaction(transaction: Omit<WalletTransaction, 'id'>) {
    try {
      console.log('Adding wallet transaction:', transaction);
      const docRef = await addDoc(collection(db, 'wallet_transactions'), {
        ...transaction,
        createdAt: serverTimestamp()
      });
      console.log('Wallet transaction added:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error adding wallet transaction:', error);
      throw error;
    }
  }

  async updateWalletBalance(userId: string, amount: number, operation: 'add' | 'subtract' = 'add') {
    try {
      console.log(`${operation === 'add' ? 'Adding' : 'Subtracting'} ${amount} to wallet for user ${userId}`);
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        walletBalance: increment(operation === 'add' ? amount : -amount),
        updatedAt: serverTimestamp()
      });
      console.log('Wallet balance updated successfully');
    } catch (error) {
      console.error('Error updating wallet balance:', error);
      throw error;
    }
  }

  async getWalletTransactions(userId: string, limitCount: number = 50) {
    try {
      console.log(`Fetching wallet transactions for user ${userId}`);
      const q = query(
        collection(db, 'wallet_transactions'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      const transactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WalletTransaction));
      console.log(`Retrieved ${transactions.length} wallet transactions`);
      return transactions;
    } catch (error) {
      console.error('Error fetching wallet transactions:', error);
      return [];
    }
  }

  // Transaction History
  async addTransaction(transaction: Omit<TransactionHistory, 'id'>) {
    try {
      console.log('Adding transaction:', transaction);
      const docRef = await addDoc(collection(db, 'transactions'), {
        ...transaction,
        createdAt: serverTimestamp()
      });
      console.log('Transaction added:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  }

  async getTransactions(userId: string, limitCount: number = 50) {
    try {
      console.log(`Fetching transactions for user ${userId}`);
      const q = query(
        collection(db, 'transactions'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      const transactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TransactionHistory));
      console.log(`Retrieved ${transactions.length} transactions`);
      return transactions;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
  }

  // Real-time listeners with error handling
  onWalletTransactionsChange(userId: string, callback: (transactions: WalletTransaction[]) => void) {
    const q = query(
      collection(db, 'wallet_transactions'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
    
    return onSnapshot(q, 
      (snapshot) => {
        try {
          const transactions = snapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data() 
          } as WalletTransaction));
          console.log(`Real-time update: ${transactions.length} wallet transactions`);
          callback(transactions);
        } catch (error) {
          console.error('Error processing wallet transactions snapshot:', error);
        }
      },
      (error) => {
        console.error('Error in wallet transactions listener:', error);
      }
    );
  }

  onUserProfileChange(userId: string, callback: (profile: UserProfile | null) => void) {
    const userRef = doc(db, 'users', userId);
    return onSnapshot(userRef, 
      (doc) => {
        try {
          const profile = doc.exists() ? doc.data() as UserProfile : null;
          console.log('Real-time profile update:', profile ? 'Profile loaded' : 'Profile not found');
          callback(profile);
        } catch (error) {
          console.error('Error processing user profile snapshot:', error);
          callback(null);
        }
      },
      (error) => {
        console.error('Error in user profile listener:', error);
        callback(null);
      }
    );
  }

  // Rest of the methods remain the same...
  async getCardInventory(userId: string) {
    try {
      const q = query(
        collection(db, 'card_inventory'),
        where('userId', '==', userId),
        orderBy('purchasedAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RechargeCardInventory));
    } catch (error) {
      console.error('Error fetching card inventory:', error);
      return [];
    }
  }

  async markCardAsPrinted(inventoryId: string, pinIndex: number) {
    try {
      const inventoryRef = doc(db, 'card_inventory', inventoryId);
      const inventoryDoc = await getDoc(inventoryRef);
      
      if (inventoryDoc.exists()) {
        const inventory = inventoryDoc.data() as RechargeCardInventory;
        const updatedPins = [...inventory.pins];
        updatedPins[pinIndex] = { ...updatedPins[pinIndex], printed: true };
        
        await updateDoc(inventoryRef, {
          pins: updatedPins,
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error marking card as printed:', error);
      throw error;
    }
  }

  async markCardAsSold(inventoryId: string, pinIndex: number) {
    try {
      const batch = writeBatch(db);
      const inventoryRef = doc(db, 'card_inventory', inventoryId);
      const inventoryDoc = await getDoc(inventoryRef);
      
      if (inventoryDoc.exists()) {
        const inventory = inventoryDoc.data() as RechargeCardInventory;
        const updatedPins = [...inventory.pins];
        updatedPins[pinIndex] = { 
          ...updatedPins[pinIndex], 
          printed: true,
          soldAt: serverTimestamp()
        };
        
        batch.update(inventoryRef, {
          pins: updatedPins,
          remainingCards: increment(-1),
          updatedAt: serverTimestamp()
        });
        
        await batch.commit();
      }
    } catch (error) {
      console.error('Error marking card as sold:', error);
      throw error;
    }
  }

  // Analytics and Reports
  async getDailySalesReport(userId: string, date: Date) {
    try {
      const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
      
      const q = query(
        collection(db, 'transactions'),
        where('userId', '==', userId),
        where('createdAt', '>=', Timestamp.fromDate(startOfDay)),
        where('createdAt', '<', Timestamp.fromDate(endOfDay)),
        where('status', '==', 'completed')
      );
      
      const snapshot = await getDocs(q);
      const transactions = snapshot.docs.map(doc => doc.data() as TransactionHistory);
      
      return {
        totalTransactions: transactions.length,
        totalAmount: transactions.reduce((sum, t) => sum + t.amount, 0),
        totalCommission: transactions.reduce((sum, t) => sum + (t.commission || 0), 0),
        byCategory: transactions.reduce((acc, t) => {
          acc[t.type] = (acc[t.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      };
    } catch (error) {
      console.error('Error generating daily sales report:', error);
      throw error;
    }
  }
}

export const databaseService = new DatabaseService();