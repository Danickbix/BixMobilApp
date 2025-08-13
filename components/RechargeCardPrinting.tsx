'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { ArrowLeft, CreditCard, Check } from 'lucide-react';
import { DenominationSelector } from './recharge-cards/DenominationSelector';
import { CardReview } from './recharge-cards/CardReview';
import { PrintCompletion } from './recharge-cards/PrintCompletion';
import { NETWORKS } from '../lib/constants';
import { generatePIN, generateSerialNumber, calculateCommission } from '../lib/utils/generators';
import type { NetworkId, RechargeCard } from '../lib/types';

interface RechargeCardPrintingProps {
  network: string;
  onBack: () => void;
  onPrintComplete: (cards: RechargeCard[]) => void;
}

export function RechargeCardPrinting({ network, onBack, onPrintComplete }: RechargeCardPrintingProps) {
  const [selectedDenominations, setSelectedDenominations] = useState<{ [key: number]: number }>({});
  const [generatedCards, setGeneratedCards] = useState<RechargeCard[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [step, setStep] = useState<'select' | 'review' | 'print'>('select');

  const networkData = NETWORKS[network as NetworkId] || NETWORKS.mtn;

  const updateQuantity = (denomination: number, change: number) => {
    setSelectedDenominations(prev => {
      const current = prev[denomination] || 0;
      const newValue = Math.max(0, current + change);
      
      if (newValue === 0) {
        const { [denomination]: removed, ...rest } = prev;
        return rest;
      }
      
      return { ...prev, [denomination]: newValue };
    });
  };

  const handleGenerateCards = () => {
    setIsGenerating(true);
    
    setTimeout(() => {
      const newCards: RechargeCard[] = [];
      
      Object.entries(selectedDenominations).forEach(([denom, quantity]) => {
        const denomination = parseInt(denom);
        for (let i = 0; i < quantity; i++) {
          newCards.push({
            id: `${Date.now()}_${denomination}_${i}`,
            denomination,
            pin: generatePIN(),
            serialNumber: generateSerialNumber(network as NetworkId),
            network: network as NetworkId,
            status: 'generated',
            generatedAt: new Date().toISOString()
          });
        }
      });
      
      setGeneratedCards(newCards);
      setIsGenerating(false);
      setStep('review');
    }, 2000);
  };

  const handlePrintCards = () => {
    setIsPrinting(true);
    
    setTimeout(() => {
      const updatedCards = generatedCards.map(card => ({
        ...card,
        status: 'printed' as const
      }));
      
      setGeneratedCards(updatedCards);
      setIsPrinting(false);
      setStep('print');
      onPrintComplete(updatedCards);
    }, 3000);
  };

  const getTotalValue = () => {
    return Object.entries(selectedDenominations).reduce((sum, [denom, qty]) => {
      return sum + (parseInt(denom) * qty);
    }, 0);
  };

  const getCommission = () => {
    return calculateCommission(getTotalValue(), network as NetworkId);
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center space-x-2">
          <CreditCard className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold">Print Recharge Cards</h1>
        </div>
      </div>

      {/* Network Header */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-center space-x-3">
            <span className="text-3xl">{networkData.logo}</span>
            <div className="text-center">
              <h2 className="text-xl font-bold">{networkData.name}</h2>
              <p className="text-sm text-muted-foreground">Recharge Cards</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-2">
        {[1, 2, 3].map((stepNumber) => (
          <div key={stepNumber} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === 'select' && stepNumber === 1 ? 'bg-primary text-primary-foreground' :
              step === 'review' && stepNumber <= 2 ? 'bg-primary text-primary-foreground' :
              step === 'print' && stepNumber <= 3 ? 'bg-primary text-primary-foreground' :
              'bg-muted text-muted-foreground'
            }`}>
              {(step === 'review' && stepNumber === 1) || 
               (step === 'print' && stepNumber <= 2) ? (
                <Check className="h-4 w-4" />
              ) : (
                stepNumber
              )}
            </div>
            {stepNumber < 3 && (
              <div className={`w-8 h-0.5 ${
                (step === 'review' && stepNumber === 1) || 
                (step === 'print' && stepNumber <= 2) ? 'bg-primary' : 'bg-muted'
              }`} />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 'select' && (
          <motion.div
            key="select"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <DenominationSelector
              selectedDenominations={selectedDenominations}
              onUpdateQuantity={updateQuantity}
              onGenerate={handleGenerateCards}
              network={network as NetworkId}
              isGenerating={isGenerating}
            />
          </motion.div>
        )}

        {step === 'review' && (
          <motion.div
            key="review"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <CardReview
              cards={generatedCards}
              onBack={() => setStep('select')}
              onPrint={handlePrintCards}
              isPrinting={isPrinting}
            />
          </motion.div>
        )}

        {step === 'print' && (
          <motion.div
            key="print"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <PrintCompletion
              cards={generatedCards}
              commission={getCommission()}
              onBack={onBack}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}