'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Smartphone, 
  Wifi, 
  CreditCard, 
  TrendingUp, 
  Bell,
  Eye,
  EyeOff,
  ChevronRight
} from 'lucide-react';
import { QuickActions } from './QuickActions';
import { RecentTransactions } from './RecentTransactions';

interface DashboardProps {
  onServiceSelect: (type: 'airtime' | 'data') => void;
  onPrintCards: (network: string) => void;
}

export function Dashboard({ onServiceSelect, onPrintCards }: DashboardProps) {
  const [showBalance, setShowBalance] = useState(true);
  const [walletBalance] = useState(25000.50);
  const [todaySales] = useState(15);
  const [todayRevenue] = useState(8500.00);

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Good morning, John</h1>
          <p className="text-sm text-muted-foreground">Ready to start selling?</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <Bell className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Wallet Balance Card */}
      <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-primary-foreground/80 text-sm">Wallet Balance</p>
              <div className="flex items-center space-x-2">
                <h2 className="text-2xl font-bold">
                  ₦{showBalance ? walletBalance.toLocaleString() : '••••••'}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBalance(!showBalance)}
                  className="text-primary-foreground/80 hover:text-primary-foreground p-1"
                >
                  {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <CreditCard className="h-8 w-8 text-primary-foreground/60" />
          </div>
          <Button 
            variant="secondary" 
            size="sm" 
            className="bg-white/20 hover:bg-white/30 text-primary-foreground border-0"
          >
            Top Up Wallet
          </Button>
        </CardContent>
      </Card>

      {/* Today's Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Today's Sales</p>
                <p className="text-lg font-bold">{todaySales}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CreditCard className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Revenue</p>
                <p className="text-lg font-bold">₦{todayRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <QuickActions onServiceSelect={onServiceSelect} onPrintCards={onPrintCards} />

      {/* Recent Transactions */}
      <RecentTransactions />

      {/* Promo Banner */}
      <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-orange-900">Special Offer!</h3>
              <p className="text-sm text-orange-700">Get 2% extra commission on MTN sales</p>
            </div>
            <Badge variant="secondary" className="bg-orange-200 text-orange-800">
              Limited
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}