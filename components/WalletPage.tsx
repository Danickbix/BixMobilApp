import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { useAuth } from '../lib/firebase/AuthContext';
import { paymentService } from '../lib/firebase/payments';
import { databaseService, WalletTransaction } from '../lib/firebase/database';
import { toast } from 'sonner@2.0.3';
import { 
  Plus, 
  CreditCard, 
  History, 
  TrendingUp, 
  Download,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw
} from 'lucide-react';
import { formatCurrency } from '../lib/utils/formatters';
import { format } from 'date-fns';

export function WalletPage() {
  const { user, userProfile, refreshUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  
  // Top-up form states
  const [amount, setAmount] = useState('');
  const [provider, setProvider] = useState<'paystack' | 'flutterwave'>('paystack');
  const [email, setEmail] = useState(user?.email || '');

  useEffect(() => {
    if (user) {
      loadTransactions();
      
      // Set up real-time listener for transactions
      const unsubscribe = databaseService.onWalletTransactionsChange(
        user.uid,
        (newTransactions) => {
          setTransactions(newTransactions);
          setLoadingTransactions(false);
        }
      );

      return unsubscribe;
    }
  }, [user]);

  const loadTransactions = async () => {
    if (!user) return;
    
    try {
      const userTransactions = await databaseService.getWalletTransactions(user.uid);
      setTransactions(userTransactions);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoadingTransactions(false);
    }
  };

  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) < 100) {
      toast.error('Minimum top-up amount is ₦100');
      return;
    }

    if (!email) {
      toast.error('Email address is required');
      return;
    }

    setLoading(true);
    
    try {
      const paymentData = {
        amount: parseFloat(amount) * 100, // Convert to kobo
        email,
        userId: user!.uid,
        metadata: {
          purpose: 'wallet_topup',
          userId: user!.uid
        }
      };

      let response;
      if (provider === 'paystack') {
        response = await paymentService.initiatePaystackPayment(paymentData);
      } else {
        response = await paymentService.initiateFlutterwavePayment(paymentData);
      }

      if (response.success && response.authorizationUrl) {
        // Open payment page in new window
        window.open(response.authorizationUrl, '_blank');
        toast.success('Payment window opened. Complete payment to add funds.');
        
        // Clear form
        setAmount('');
      } else {
        toast.error(response.message || 'Failed to initialize payment');
      }
    } catch (error: any) {
      toast.error(error.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const refreshBalance = async () => {
    await refreshUserProfile();
    toast.success('Balance updated');
  };

  const getTransactionIcon = (type: 'credit' | 'debit') => {
    return type === 'credit' ? (
      <ArrowDownLeft className="text-green-600" size={16} />
    ) : (
      <ArrowUpRight className="text-red-600" size={16} />
    );
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'default' as const,
      pending: 'secondary' as const,
      failed: 'destructive' as const
    };
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (!userProfile) {
    return (
      <div className="p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading wallet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Wallet Balance Card */}
      <Card className="bg-gradient-to-r from-primary to-blue-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Wallet Balance</p>
              <p className="text-3xl font-bold">
                {formatCurrency(userProfile.walletBalance || 0)}
              </p>
              <p className="text-blue-100 text-sm mt-1">
                Available for transactions
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Button 
                variant="secondary" 
                size="sm"
                onClick={refreshBalance}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <RefreshCw size={16} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="mx-auto mb-2 text-green-600" size={24} />
            <p className="font-medium">Total Earned</p>
            <p className="text-lg font-bold text-green-600">
              ₦{((userProfile.walletBalance || 0) * 0.1).toLocaleString()}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <History className="mx-auto mb-2 text-blue-600" size={24} />
            <p className="font-medium">Transactions</p>
            <p className="text-lg font-bold text-blue-600">
              {transactions.length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Up Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus size={20} />
            Top Up Wallet
          </CardTitle>
          <CardDescription>
            Add funds to your wallet using Paystack or Flutterwave
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleTopUp} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₦)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="1000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="100"
                  step="50"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="provider">Payment Method</Label>
                <Select value={provider} onValueChange={(value: 'paystack' | 'flutterwave') => setProvider(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paystack">Paystack</SelectItem>
                    <SelectItem value="flutterwave">Flutterwave</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              <CreditCard className="mr-2" size={16} />
              {loading ? 'Processing...' : `Pay ₦${amount || '0'}`}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <History size={20} />
              Recent Transactions
            </span>
            <Button variant="outline" size="sm">
              <Download size={16} className="mr-2" />
              Export
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingTransactions ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-3 bg-gray-100 rounded animate-pulse w-2/3"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                </div>
              ))}
            </div>
          ) : transactions.length > 0 ? (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${
                      transaction.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>
                          {transaction.createdAt ? 
                            format(transaction.createdAt.toDate(), 'MMM dd, yyyy HH:mm') :
                            'Recent'
                          }
                        </span>
                        {getStatusBadge(transaction.status)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${
                      transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'credit' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </p>
                    {transaction.reference && (
                      <p className="text-xs text-muted-foreground">
                        {transaction.reference.slice(-8)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <History className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-muted-foreground">No transactions yet</p>
              <p className="text-sm text-muted-foreground">
                Your wallet transactions will appear here
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}