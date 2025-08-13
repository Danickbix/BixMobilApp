'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { 
  ArrowLeft,
  Smartphone,
  Wifi,
  Check,
  Info,
  Zap
} from 'lucide-react';

interface ServicePurchaseProps {
  serviceType: ServiceType;
  onBack: () => void;
  onPurchase: (details: any) => void;
}

import { NETWORKS, DATA_BUNDLES } from '../lib/constants';
import { calculateCommission } from '../lib/utils/generators';
import type { NetworkId, ServiceType } from '../lib/types';

export function ServicePurchase({ serviceType, onBack, onPurchase }: ServicePurchaseProps) {
  const [selectedNetwork, setSelectedNetwork] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedBundle, setSelectedBundle] = useState<any>(null);
  const [step, setStep] = useState(1); // 1: Network, 2: Details, 3: Confirmation

  const handleNetworkSelect = (networkId: string) => {
    setSelectedNetwork(networkId);
    setStep(2);
  };

  const handleProceed = () => {
    if (serviceType === 'airtime') {
      if (!phoneNumber || !amount) return;
    } else {
      if (!phoneNumber || !selectedBundle) return;
    }
    setStep(3);
  };

  const handleConfirmPurchase = () => {
    const purchaseDetails = {
      serviceType,
      network: selectedNetwork,
      phoneNumber,
      amount: serviceType === 'airtime' ? parseFloat(amount) : selectedBundle.price,
      bundle: selectedBundle,
      commission: getCommission()
    };
    onPurchase(purchaseDetails);
  };

  const getCommission = () => {
    const purchaseAmount = serviceType === 'airtime' ? parseFloat(amount || '0') : selectedBundle?.price || 0;
    return calculateCommission(purchaseAmount, selectedNetwork as NetworkId);
  };

  const selectedNetworkData = NETWORKS[selectedNetwork as NetworkId];

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center space-x-2">
          {serviceType === 'airtime' ? (
            <Smartphone className="h-5 w-5 text-primary" />
          ) : (
            <Wifi className="h-5 w-5 text-primary" />
          )}
          <h1 className="text-xl font-bold">
            Buy {serviceType === 'airtime' ? 'Airtime' : 'Data Bundle'}
          </h1>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-2">
        {[1, 2, 3].map((stepNumber) => (
          <div key={stepNumber} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= stepNumber 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground'
            }`}>
              {step > stepNumber ? <Check className="h-4 w-4" /> : stepNumber}
            </div>
            {stepNumber < 3 && (
              <div className={`w-8 h-0.5 ${
                step > stepNumber ? 'bg-primary' : 'bg-muted'
              }`} />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Network Selection */}
        {step === 1 && (
          <motion.div
            key="network-selection"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Select Network</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(NETWORKS).map(([networkId, network]) => (
                  <Button
                    key={networkId}
                    variant="outline"
                    onClick={() => handleNetworkSelect(networkId)}
                    className="w-full h-auto p-4 justify-between hover:border-primary"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{network.logo}</span>
                      <div className="text-left">
                        <p className="font-medium">{network.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {network.commission} commission
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Available
                    </Badge>
                  </Button>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 2: Details */}
        {step === 2 && (
          <motion.div
            key="details"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <span className="text-xl">{selectedNetworkData?.logo}</span>
                  <CardTitle className="text-lg">{selectedNetworkData?.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Phone Number */}
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="e.g. 08012345678"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="mt-1"
                  />
                </div>

                {serviceType === 'airtime' ? (
                  /* Airtime Amount */
                  <div>
                    <Label htmlFor="amount">Amount (₦)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Enter amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="mt-1"
                    />
                    <div className="flex flex-wrap gap-2 mt-2">
                      {[100, 200, 500, 1000, 2000, 5000].map((preset) => (
                        <Button
                          key={preset}
                          variant="outline"
                          size="sm"
                          onClick={() => setAmount(preset.toString())}
                          className="text-xs"
                        >
                          ₦{preset}
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Data Bundles */
                  <div>
                    <Label>Select Data Bundle</Label>
                    <div className="grid gap-2 mt-2">
                      {DATA_BUNDLES[selectedNetwork as keyof typeof DATA_BUNDLES]?.map((bundle, index) => (
                        <Button
                          key={index}
                          variant={selectedBundle === bundle ? "default" : "outline"}
                          onClick={() => setSelectedBundle(bundle)}
                          className="w-full h-auto p-3 justify-between"
                        >
                          <div className="text-left">
                            <p className="font-medium">{bundle.size}</p>
                            <p className="text-xs text-muted-foreground">
                              Valid for {bundle.validity}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">₦{bundle.price}</p>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleProceed}
                  className="w-full"
                  disabled={
                    !phoneNumber || 
                    (serviceType === 'airtime' ? !amount : !selectedBundle)
                  }
                >
                  Continue
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <motion.div
            key="confirmation"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Confirm Purchase</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Purchase Summary */}
                <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Network:</span>
                    <div className="flex items-center space-x-2">
                      <span>{selectedNetworkData?.logo}</span>
                      <span className="font-medium">{selectedNetworkData?.name}</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone Number:</span>
                    <span className="font-medium">{phoneNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {serviceType === 'airtime' ? 'Amount:' : 'Data Bundle:'}
                    </span>
                    <span className="font-medium">
                      {serviceType === 'airtime' 
                        ? `₦${amount}` 
                        : `${selectedBundle?.size} - ₦${selectedBundle?.price}`
                      }
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-3">
                    <span className="text-muted-foreground">Your Commission:</span>
                    <span className="font-medium text-green-600">
                      +₦{getCommission().toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg">
                  <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="text-blue-900 font-medium">Transaction Details</p>
                    <p className="text-blue-700">
                      You will receive a receipt after successful purchase. 
                      Commission will be added to your wallet immediately.
                    </p>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setStep(2)}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleConfirmPurchase}
                    className="flex-1"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Confirm Purchase
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}