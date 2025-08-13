'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  ArrowLeft,
  Download,
  Share2,
  Printer,
  CheckCircle,
  XCircle,
  Clock,
  Copy,
  Smartphone
} from 'lucide-react';

interface TransactionReceiptProps {
  transaction: {
    id: string;
    type: 'airtime' | 'data';
    network: string;
    phoneNumber: string;
    amount: number;
    commission: number;
    status: 'completed' | 'pending' | 'failed';
    timestamp: string;
    bundle?: {
      size: string;
      validity: string;
    };
    reference: string;
  };
  onBack: () => void;
}

const networkLogos = {
  mtn: '🟡',
  glo: '🟢',
  airtel: '🔴',
  '9mobile': '🟢'
};

export function TransactionReceipt({ transaction, onBack }: TransactionReceiptProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyReference = () => {
    navigator.clipboard.writeText(transaction.reference);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    // In a real app, this would connect to Bluetooth printer
    alert('Connecting to Bluetooth printer...');
    console.log('Print receipt:', transaction);
  };

  const handleShare = () => {
    const receiptText = `
Bix Mobil Vest Receipt
${transaction.type === 'airtime' ? 'Airtime' : 'Data'} Purchase

Network: ${transaction.network.toUpperCase()}
Phone: ${transaction.phoneNumber}
Amount: ₦${transaction.amount}
${transaction.bundle ? `Data: ${transaction.bundle.size}` : ''}
Status: ${transaction.status}
Reference: ${transaction.reference}
Date: ${new Date(transaction.timestamp).toLocaleString()}

Commission Earned: ₦${transaction.commission}
    `;

    if (navigator.share) {
      navigator.share({
        title: 'Transaction Receipt',
        text: receiptText
      });
    } else {
      navigator.clipboard.writeText(receiptText);
      alert('Receipt copied to clipboard');
    }
  };

  const getStatusIcon = () => {
    switch (transaction.status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />;
    }
  };

  const getStatusColor = () => {
    switch (transaction.status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Transaction Receipt</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Receipt Card */}
      <Card className="border-2 border-dashed border-muted">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Smartphone className="h-6 w-6 text-primary" />
            <CardTitle className="text-lg">Bix Mobil Vest</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            Mobile Recharge & Data Sales
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Status */}
          <div className="flex items-center justify-center space-x-2">
            {getStatusIcon()}
            <Badge variant="secondary" className={getStatusColor()}>
              {transaction.status.toUpperCase()}
            </Badge>
          </div>

          <Separator />

          {/* Transaction Details */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Transaction Type:</span>
              <span className="font-medium capitalize">
                {transaction.type === 'airtime' ? 'Airtime Purchase' : 'Data Bundle'}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Network:</span>
              <div className="flex items-center space-x-2">
                <span>{networkLogos[transaction.network as keyof typeof networkLogos]}</span>
                <span className="font-medium">{transaction.network.toUpperCase()}</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Phone Number:</span>
              <span className="font-medium">{transaction.phoneNumber}</span>
            </div>

            {transaction.bundle && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Data Bundle:</span>
                  <span className="font-medium">{transaction.bundle.size}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Validity:</span>
                  <span className="font-medium">{transaction.bundle.validity}</span>
                </div>
              </>
            )}

            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Amount:</span>
              <span className="font-bold text-lg">₦{transaction.amount.toLocaleString()}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Commission:</span>
              <span className="font-medium text-green-600">+₦{transaction.commission}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Date & Time:</span>
              <span className="font-medium text-sm">
                {new Date(transaction.timestamp).toLocaleString()}
              </span>
            </div>
          </div>

          <Separator />

          {/* Reference Number */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Reference:</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyReference}
                className="h-auto p-1"
              >
                <Copy className="h-3 w-3 mr-1" />
                <span className="text-xs">{copied ? 'Copied!' : 'Copy'}</span>
              </Button>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-center font-mono text-sm">{transaction.reference}</p>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 text-center space-y-2">
            <p className="text-xs text-muted-foreground">
              Thank you for your business!
            </p>
            <p className="text-xs text-muted-foreground">
              Keep this receipt for your records
            </p>
            <Separator />
            <p className="text-xs text-muted-foreground">
              Powered by Bix Mobil Vest • support@bixmobilvest.com
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" onClick={handlePrint} className="flex items-center justify-center">
          <Printer className="h-4 w-4 mr-2" />
          Print Receipt
        </Button>
        <Button onClick={handleShare} className="flex items-center justify-center">
          <Share2 className="h-4 w-4 mr-2" />
          Share Receipt
        </Button>
      </div>

      {/* Print Instructions */}
      {transaction.status === 'completed' && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-2">
              <Printer className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="text-blue-900 font-medium">Print Instructions</p>
                <p className="text-blue-700">
                  Make sure your Bluetooth printer is connected and turned on. 
                  Go to Settings → Printer Setup to configure your printer.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}