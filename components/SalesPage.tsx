'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { 
  Calendar,
  Download,
  Filter,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Search
} from 'lucide-react';
import { Input } from './ui/input';

const salesData = [
  { period: 'Today', sales: 15, revenue: 8500, commission: 170 },
  { period: 'This Week', sales: 89, revenue: 45200, commission: 904 },
  { period: 'This Month', sales: 342, revenue: 178500, commission: 3570 }
];

const salesHistory = [
  {
    id: '1',
    date: '2024-08-10',
    time: '14:30',
    product: 'MTN Airtime',
    amount: 1000,
    commission: 20,
    customer: '+234 801 234 5678',
    status: 'completed'
  },
  {
    id: '2',
    date: '2024-08-10',
    time: '14:15',
    product: 'GLO Data 2GB',
    amount: 2500,
    commission: 50,
    customer: '+234 808 765 4321',
    status: 'completed'
  },
  {
    id: '3',
    date: '2024-08-10',
    time: '13:45',
    product: 'AIRTEL Airtime',
    amount: 500,
    commission: 10,
    customer: '+234 802 987 6543',
    status: 'pending'
  },
  {
    id: '4',
    date: '2024-08-10',
    time: '13:20',
    product: 'MTN Data 5GB',
    amount: 5000,
    commission: 100,
    customer: '+234 809 123 4567',
    status: 'completed'
  },
  {
    id: '5',
    date: '2024-08-09',
    time: '16:30',
    product: '9MOBILE Airtime',
    amount: 2000,
    commission: 40,
    customer: '+234 817 654 3210',
    status: 'completed'
  }
];

interface SalesPageProps {
  onOpenInventory?: () => void;
}

export function SalesPage({ onOpenInventory }: SalesPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('today');

  const filteredSales = salesHistory.filter(sale =>
    sale.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.customer.includes(searchTerm)
  );

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Sales Overview</h1>
          <p className="text-sm text-muted-foreground">Track your performance</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-3">
        {salesData.map((stat, index) => (
          <Card key={stat.period} className={index === 0 ? 'border-primary' : ''}>
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground mb-2">{stat.period}</p>
              <p className="text-lg font-bold">{stat.sales}</p>
              <p className="text-xs text-muted-foreground">Sales</p>
              <div className="mt-2 pt-2 border-t">
                <p className="text-xs text-green-600">₦{stat.commission} earned</p>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {/* Card Inventory Access */}
        <Card 
          className="cursor-pointer hover:bg-primary/5 hover:border-primary transition-colors" 
          onClick={onOpenInventory}
        >
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-2">Inventory</p>
            <p className="text-lg font-bold text-primary">156</p>
            <p className="text-xs text-muted-foreground">Cards Ready</p>
            <div className="mt-2 pt-2 border-t">
              <p className="text-xs text-primary">View All →</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Performance Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Performance Chart</CardTitle>
        </CardHeader>
        <CardContent className="h-32 flex items-center justify-center bg-muted/20 rounded-lg">
          <div className="text-center">
            <TrendingUp className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Chart will be displayed here</p>
          </div>
        </CardContent>
      </Card>

      {/* Sales History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Sales History</CardTitle>
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Today
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Transaction List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredSales.map((sale) => (
              <div
                key={sale.id}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50"
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-sm">{sale.product}</p>
                    <Badge
                      variant={sale.status === 'completed' ? 'default' : 'secondary'}
                      className={
                        sale.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }
                    >
                      {sale.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{sale.customer}</p>
                  <p className="text-xs text-muted-foreground">
                    {sale.date} at {sale.time}
                  </p>
                </div>
                
                <div className="text-right ml-4">
                  <p className="font-medium text-sm">₦{sale.amount.toLocaleString()}</p>
                  <p className="text-xs text-green-600">+₦{sale.commission}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}