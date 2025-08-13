'use client';

import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { CheckCircle, Download } from 'lucide-react';
import { formatCurrency } from '../../lib/utils/formatters';
import type { RechargeCard } from '../../lib/types';

interface PrintCompletionProps {
  cards: RechargeCard[];
  commission: number;
  onBack: () => void;
}

export function PrintCompletion({ cards, commission, onBack }: PrintCompletionProps) {
  const cardsByDenom = cards.reduce((acc, card) => {
    acc[card.denomination] = (acc[card.denomination] || 0) + 1;
    return acc;
  }, {} as { [key: number]: number });

  const totalValue = cards.reduce((sum, card) => sum + card.denomination, 0);

  return (
    <div className="space-y-4">
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-6 text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          
          <div>
            <h3 className="font-bold text-lg">Cards Printed Successfully!</h3>
            <p className="text-sm text-green-700">
              {cards.length} recharge cards have been printed and are ready for sale.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-white rounded-lg">
              <p className="text-muted-foreground">Cards Printed</p>
              <p className="font-bold">{cards.length}</p>
            </div>
            <div className="p-3 bg-white rounded-lg">
              <p className="text-muted-foreground">Commission Earned</p>
              <p className="font-bold text-green-600">+{formatCurrency(commission)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-3">
          <h4 className="font-medium">Printed Cards Summary</h4>
          
          {Object.entries(cardsByDenom).map(([denom, count]) => (
            <div key={denom} className="flex justify-between items-center">
              <span>{formatCurrency(parseInt(denom))} Cards</span>
              <Badge variant="secondary">{count} pieces</Badge>
            </div>
          ))}
          
          <Separator />
          
          <div className="flex justify-between items-center font-medium">
            <span>Total Value</span>
            <span>{formatCurrency(totalValue)}</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" onClick={() => window.print()}>
          <Download className="h-4 w-4 mr-2" />
          Print Summary
        </Button>
        <Button onClick={onBack}>
          Print More Cards
        </Button>
      </div>
    </div>
  );
}