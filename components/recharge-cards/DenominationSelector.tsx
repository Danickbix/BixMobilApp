'use client';

import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Plus, Minus, Package } from 'lucide-react';
import { DENOMINATIONS } from '../../lib/constants';
import { formatCurrency } from '../../lib/utils/formatters';
import { calculateCommission } from '../../lib/utils/generators';
import type { NetworkId } from '../../lib/types';

interface DenominationSelectorProps {
  selectedDenominations: { [key: number]: number };
  onUpdateQuantity: (denomination: number, change: number) => void;
  onGenerate: () => void;
  network: NetworkId;
  isGenerating: boolean;
}

export function DenominationSelector({
  selectedDenominations,
  onUpdateQuantity,
  onGenerate,
  network,
  isGenerating
}: DenominationSelectorProps) {
  const getTotalCards = () => {
    return Object.values(selectedDenominations).reduce((sum, qty) => sum + qty, 0);
  };

  const getTotalValue = () => {
    return Object.entries(selectedDenominations).reduce((sum, [denom, qty]) => {
      return sum + (parseInt(denom) * qty);
    }, 0);
  };

  const getCommission = () => {
    return calculateCommission(getTotalValue(), network);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Denominations & Quantities</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {DENOMINATIONS.map(denom => (
          <div key={denom} className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">{formatCurrency(denom)}</p>
              <p className="text-sm text-muted-foreground">Recharge Card</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUpdateQuantity(denom, -1)}
                disabled={!selectedDenominations[denom]}
              >
                <Minus className="h-4 w-4" />
              </Button>
              
              <span className="w-12 text-center font-medium">
                {selectedDenominations[denom] || 0}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUpdateQuantity(denom, 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        
        {getTotalCards() > 0 && (
          <div className="p-4 bg-primary/5 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span>Total Cards:</span>
              <span className="font-medium">{getTotalCards()} cards</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Total Value:</span>
              <span className="font-medium">{formatCurrency(getTotalValue())}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Your Commission:</span>
              <span className="font-medium text-green-600">
                +{formatCurrency(getCommission())}
              </span>
            </div>
          </div>
        )}
        
        <Button
          onClick={onGenerate}
          disabled={getTotalCards() === 0 || isGenerating}
          className="w-full"
        >
          {isGenerating ? 'Generating Cards...' : (
            <>
              <Package className="h-4 w-4 mr-2" />
              Generate {getTotalCards()} Cards
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}