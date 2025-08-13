'use client';

import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { 
  Smartphone, 
  Wifi, 
  CreditCard, 
  FileText
} from 'lucide-react';
import { NETWORKS } from '../lib/constants';

interface QuickActionsProps {
  onServiceSelect: (type: 'airtime' | 'data') => void;
  onPrintCards: (network: string) => void;
}

export function QuickActions({ onServiceSelect, onPrintCards }: QuickActionsProps) {
  const quickActions = [
    {
      id: 'airtime',
      title: 'Buy Airtime',
      subtitle: 'Direct recharge',
      icon: Smartphone,
      color: 'bg-green-100 text-green-600'
    },
    {
      id: 'data',
      title: 'Data Bundles', 
      subtitle: 'Internet plans',
      icon: Wifi,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      id: 'print-cards',
      title: 'Print Cards',
      subtitle: 'Recharge vouchers', 
      icon: CreditCard,
      color: 'bg-primary/10 text-primary'
    },
    {
      id: 'bills',
      title: 'Pay Bills',
      subtitle: 'Utilities & more',
      icon: FileText,
      color: 'bg-purple-100 text-purple-600'
    }
  ];

  const handleServiceClick = (serviceId: string) => {
    if (serviceId === 'airtime') {
      onServiceSelect('airtime');
    } else if (serviceId === 'data') {
      onServiceSelect('data');
    } else if (serviceId === 'print-cards') {
      onPrintCards('mtn');
    } else {
      console.log(`Opening ${serviceId} service`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            
            return (
              <Button
                key={action.id}
                variant="outline"
                onClick={() => handleServiceClick(action.id)}
                className="h-auto p-4 flex flex-col items-center space-y-2 border-2 hover:border-primary hover:bg-primary/5"
              >
                <div className={`p-3 rounded-full ${action.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-sm">{action.title}</p>
                  <p className="text-xs text-muted-foreground">{action.subtitle}</p>
                </div>
              </Button>
            );
          })}
        </div>

        {/* Print Recharge Cards */}
        <div className="mt-6">
          <h4 className="text-sm font-medium mb-3">Print Recharge Cards</h4>
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(NETWORKS).map(([networkId, network]) => (
              <Button
                key={`print-${networkId}`}
                variant="outline"
                size="sm"
                onClick={() => onPrintCards(networkId)}
                className="flex flex-col items-center p-3 h-auto bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 hover:bg-primary/10"
              >
                <span className="text-lg mb-1">{network.logo}</span>
                <span className="text-xs">Print {network.name}</span>
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}