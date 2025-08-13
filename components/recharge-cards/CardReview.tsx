'use client';

import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { CheckCircle, Printer, RefreshCw } from 'lucide-react';
import { maskPinShort, formatCurrency } from '../../lib/utils/formatters';
import type { RechargeCard } from '../../lib/types';

interface CardReviewProps {
  cards: RechargeCard[];
  onBack: () => void;
  onPrint: () => void;
  isPrinting: boolean;
}

export function CardReview({ cards, onBack, onPrint, isPrinting }: CardReviewProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span>Cards Generated</span>
          </CardTitle>
          <Badge variant="secondary">{cards.length} cards</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="max-h-60 overflow-y-auto space-y-2">
          {cards.map(card => (
            <div key={card.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium">{formatCurrency(card.denomination)}</p>
                <p className="text-xs text-muted-foreground">{card.serialNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-mono">{maskPinShort(card.pin)}</p>
                <Badge variant="outline" className="text-xs">
                  {card.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex-1"
          >
            Back
          </Button>
          <Button
            onClick={onPrint}
            disabled={isPrinting}
            className="flex-1"
          >
            {isPrinting ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Printing...
              </>
            ) : (
              <>
                <Printer className="h-4 w-4 mr-2" />
                Print Cards
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}