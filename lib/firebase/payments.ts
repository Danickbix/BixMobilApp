import { httpsCallable } from 'firebase/functions';
import { functions } from './config';
import { databaseService } from './database';

export interface PaymentRequest {
  amount: number;
  email: string;
  userId: string;
  reference?: string;
  metadata?: Record<string, any>;
}

export interface PaymentResponse {
  success: boolean;
  reference: string;
  authorizationUrl?: string;
  message?: string;
  data?: any;
}

export interface RechargeCardPurchase {
  network: 'MTN' | 'GLO' | 'AIRTEL' | '9MOBILE';
  denomination: number;
  quantity: number;
  userId: string;
}

export interface DataBundlePurchase {
  network: 'MTN' | 'GLO' | 'AIRTEL' | '9MOBILE';
  plan: string;
  phoneNumber: string;
  userId: string;
  amount: number;
}

class PaymentService {
  // Wallet top-up with Paystack
  async initiatePaystackPayment(paymentData: PaymentRequest): Promise<PaymentResponse> {
    try {
      const initializePayment = httpsCallable(functions, 'initializePaystackPayment');
      const result = await initializePayment(paymentData);
      return result.data as PaymentResponse;
    } catch (error: any) {
      console.error('Paystack payment error:', error);
      return {
        success: false,
        reference: '',
        message: error.message || 'Payment initialization failed'
      };
    }
  }

  // Wallet top-up with Flutterwave
  async initiateFlutterwavePayment(paymentData: PaymentRequest): Promise<PaymentResponse> {
    try {
      const initializePayment = httpsCallable(functions, 'initializeFlutterwavePayment');
      const result = await initializePayment(paymentData);
      return result.data as PaymentResponse;
    } catch (error: any) {
      console.error('Flutterwave payment error:', error);
      return {
        success: false,
        reference: '',
        message: error.message || 'Payment initialization failed'
      };
    }
  }

  // Verify payment status
  async verifyPayment(reference: string, provider: 'paystack' | 'flutterwave'): Promise<PaymentResponse> {
    try {
      const verifyPayment = httpsCallable(functions, 'verifyPayment');
      const result = await verifyPayment({ reference, provider });
      
      const response = result.data as PaymentResponse;
      
      // If payment is successful, update wallet balance
      if (response.success && response.data) {
        await databaseService.updateWalletBalance(
          response.data.userId, 
          response.data.amount / 100 // Convert from kobo to naira
        );
        
        // Add wallet transaction record
        await databaseService.addWalletTransaction({
          userId: response.data.userId,
          type: 'credit',
          amount: response.data.amount / 100,
          description: `Wallet top-up via ${provider}`,
          reference: reference,
          status: 'completed',
          metadata: { provider, paymentData: response.data }
        });
      }
      
      return response;
    } catch (error: any) {
      console.error('Payment verification error:', error);
      return {
        success: false,
        reference: '',
        message: error.message || 'Payment verification failed'
      };
    }
  }

  // Purchase recharge cards
  async purchaseRechargeCards(purchase: RechargeCardPurchase): Promise<PaymentResponse> {
    try {
      const purchaseCards = httpsCallable(functions, 'purchaseRechargeCards');
      const result = await purchaseCards(purchase);
      
      const response = result.data as PaymentResponse & { 
        cards?: Array<{ pin: string; serial: string }>;
        totalCost?: number;
      };
      
      // If purchase is successful, add to inventory and deduct from wallet
      if (response.success && response.cards) {
        const totalCost = response.totalCost || 0;
        
        // Deduct from wallet
        await databaseService.updateWalletBalance(purchase.userId, totalCost, 'subtract');
        
        // Add to inventory
        await databaseService.addCardInventory({
          userId: purchase.userId,
          network: purchase.network,
          denomination: purchase.denomination,
          pins: response.cards.map(card => ({
            pin: card.pin,
            serial: card.serial,
            printed: false
          })),
          totalCards: purchase.quantity,
          remainingCards: purchase.quantity,
          costPrice: totalCost,
          sellingPrice: purchase.denomination * purchase.quantity
        });
        
        // Add transaction record
        await databaseService.addTransaction({
          userId: purchase.userId,
          type: 'recharge_card',
          amount: totalCost,
          status: 'completed',
          description: `${purchase.quantity}x ₦${purchase.denomination} ${purchase.network} cards`,
          reference: response.reference,
          commission: totalCost * 0.025, // 2.5% commission
          metadata: {
            network: purchase.network,
            denomination: purchase.denomination,
            quantity: purchase.quantity
          }
        });
      }
      
      return response;
    } catch (error: any) {
      console.error('Recharge card purchase error:', error);
      return {
        success: false,
        reference: '',
        message: error.message || 'Card purchase failed'
      };
    }
  }

  // Purchase data bundle
  async purchaseDataBundle(purchase: DataBundlePurchase): Promise<PaymentResponse> {
    try {
      const purchaseData = httpsCallable(functions, 'purchaseDataBundle');
      const result = await purchaseData(purchase);
      
      const response = result.data as PaymentResponse;
      
      // If purchase is successful, deduct from wallet and add transaction
      if (response.success) {
        // Deduct from wallet
        await databaseService.updateWalletBalance(purchase.userId, purchase.amount, 'subtract');
        
        // Add transaction record
        await databaseService.addTransaction({
          userId: purchase.userId,
          type: 'data_bundle',
          amount: purchase.amount,
          status: 'completed',
          description: `${purchase.plan} data for ${purchase.phoneNumber}`,
          reference: response.reference,
          commission: purchase.amount * 0.025, // 2.5% commission
          metadata: {
            network: purchase.network,
            plan: purchase.plan,
            phoneNumber: purchase.phoneNumber
          }
        });
      }
      
      return response;
    } catch (error: any) {
      console.error('Data bundle purchase error:', error);
      return {
        success: false,
        reference: '',
        message: error.message || 'Data purchase failed'
      };
    }
  }

  // Get available data plans
  async getDataPlans(network: string) {
    try {
      const getPlans = httpsCallable(functions, 'getDataPlans');
      const result = await getPlans({ network });
      return result.data;
    } catch (error: any) {
      console.error('Error fetching data plans:', error);
      return { success: false, plans: [] };
    }
  }

  // Check account balance with service provider
  async checkAccountBalance(userId: string) {
    try {
      const checkBalance = httpsCallable(functions, 'checkAccountBalance');
      const result = await checkBalance({ userId });
      return result.data;
    } catch (error: any) {
      console.error('Error checking account balance:', error);
      return { success: false, balance: 0 };
    }
  }
}

export const paymentService = new PaymentService();