'use client';

import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ChevronRight, Smartphone, Wifi, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

const recentTransactions = [
  {
    id: '1',
    type: 'airtime',
    network: 'MTN',
    amount: 1000,
    commission: 20,
    status: 'completed',
    time: '2 mins ago',
    customer: '+234 801 234 5678'
  },
  {
    id: '2',
    type: 'data',
    network: 'GLO',
    amount: 2500,
    commission: 50,
    status: 'completed',
    time: '15 mins ago',
    customer: '+234 808 765 4321'
  },
  {
    id: '3',
    type: 'airtime',
    network: 'AIRTEL',
    amount: 500,
    commission: 10,
    status: 'pending',
    time: '1 hour ago',
    customer: '+234 802 987 6543'
  },
  {
    id: '4',
    type: 'wallet_topup',
    network: 'Bank Transfer',
    amount: 10000,
    commission: 0,
    status: 'completed',
    time: '2 hours ago',
    customer: 'Wallet Top-up'
  }
];

const statusColors = {
  completed: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  failed: 'bg-red-100 text-red-800'
};

export function RecentTransactions() {
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'airtime':
        return <Smartphone className="h-4 w-4" />;
      case 'data':
        return <Wifi className="h-4 w-4" />;
      case 'wallet_topup':
        return <ArrowDownLeft className="h-4 w-4 text-green-600" />;
      default:
        return <ArrowUpRight className="h-4 w-4" />;
    }
  };

  const getTransactionTitle = (transaction: any) => {
    if (transaction.type === 'wallet_topup') {
      return 'Wallet Top-up';
    }
    return `${transaction.network} ${transaction.type === 'airtime' ? 'Airtime' : 'Data'}`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Recent Transactions</CardTitle>
          <Button variant="ghost" size="sm">
            View All
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {recentTransactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-full text-primary">
                {getTransactionIcon(transaction.type)}
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">
                  {getTransactionTitle(transaction)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {transaction.customer}
                </p>
                <p className="text-xs text-muted-foreground">
                  {transaction.time}
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="font-medium text-sm">
                {transaction.type === 'wallet_topup' ? '+' : '-'}₦{transaction.amount.toLocaleString()}
              </p>
              {transaction.commission > 0 && (
                <p className="text-xs text-green-600">
                  +₦{transaction.commission} commission
                </p>
              )}
              <Badge
                variant="secondary"
                className={`text-xs mt-1 ${statusColors[transaction.status as keyof typeof statusColors]}`}
              >
                {transaction.status}
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}