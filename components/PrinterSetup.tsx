'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { 
  ArrowLeft,
  Printer,
  Search,
  Bluetooth,
  CheckCircle,
  AlertCircle,
  Settings,
  RefreshCw,
  Zap
} from 'lucide-react';

interface PrinterSetupProps {
  onBack: () => void;
}

interface BluetoothPrinter {
  id: string;
  name: string;
  address: string;
  connected: boolean;
  type: 'thermal' | 'inkjet' | 'unknown';
  battery?: number;
}

export function PrinterSetup({ onBack }: PrinterSetupProps) {
  const [scanning, setScanning] = useState(false);
  const [bluetoothEnabled, setBluetoothEnabled] = useState(true);
  const [availablePrinters, setAvailablePrinters] = useState<BluetoothPrinter[]>([
    {
      id: '1',
      name: 'HPRT N41BT',
      address: 'DC:0D:30:12:34:56',
      connected: true,
      type: 'thermal',
      battery: 85
    },
    {
      id: '2',
      name: 'Xprinter XP-58',
      address: 'AC:23:3F:65:78:90',
      connected: false,
      type: 'thermal'
    },
    {
      id: '3',
      name: 'EPSON TM-P20',
      address: 'BC:47:60:AB:CD:EF',
      connected: false,
      type: 'thermal',
      battery: 62
    }
  ]);
  const [connectedPrinter, setConnectedPrinter] = useState<string>('1');
  const [autoPrint, setAutoPrint] = useState(true);

  const handleScanForPrinters = () => {
    setScanning(true);
    
    // Simulate scanning for printers
    setTimeout(() => {
      setScanning(false);
      // Add a new found printer
      const newPrinter: BluetoothPrinter = {
        id: Date.now().toString(),
        name: 'Unknown Printer',
        address: 'FF:EE:DD:CC:BB:AA',
        connected: false,
        type: 'unknown'
      };
      setAvailablePrinters(prev => [...prev, newPrinter]);
    }, 3000);
  };

  const handleConnectPrinter = (printerId: string) => {
    // Simulate connection process
    setAvailablePrinters(prev => 
      prev.map(printer => ({
        ...printer,
        connected: printer.id === printerId ? true : printer.id === connectedPrinter ? false : printer.connected
      }))
    );
    setConnectedPrinter(printerId);
    
    // Show success message
    alert('Printer connected successfully!');
  };

  const handleDisconnectPrinter = (printerId: string) => {
    setAvailablePrinters(prev => 
      prev.map(printer => ({
        ...printer,
        connected: printer.id === printerId ? false : printer.connected
      }))
    );
    if (connectedPrinter === printerId) {
      setConnectedPrinter('');
    }
  };

  const handleTestPrint = () => {
    if (!connectedPrinter) {
      alert('Please connect a printer first');
      return;
    }
    
    alert('Printing test receipt...');
    console.log('Test print sent to printer:', connectedPrinter);
  };

  const getPrinterIcon = (type: string) => {
    switch (type) {
      case 'thermal':
        return '🖨️';
      case 'inkjet':
        return '🖨️';
      default:
        return '❓';
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center space-x-2">
          <Printer className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold">Printer Setup</h1>
        </div>
      </div>

      {/* Bluetooth Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bluetooth className="h-5 w-5" />
            <span>Bluetooth Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Bluetooth</Label>
              <p className="text-sm text-muted-foreground">
                Required for connecting to receipt printers
              </p>
            </div>
            <Switch 
              checked={bluetoothEnabled} 
              onCheckedChange={setBluetoothEnabled}
            />
          </div>

          {bluetoothEnabled && (
            <div className="flex items-center justify-between pt-2 border-t">
              <div>
                <p className="font-medium text-sm">Scan for Printers</p>
                <p className="text-xs text-muted-foreground">
                  Make sure your printer is in pairing mode
                </p>
              </div>
              <Button 
                onClick={handleScanForPrinters}
                disabled={scanning}
                variant="outline"
                size="sm"
              >
                {scanning ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                {scanning ? 'Scanning...' : 'Scan'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Printers */}
      {bluetoothEnabled && (
        <Card>
          <CardHeader>
            <CardTitle>Available Printers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {availablePrinters.length === 0 ? (
              <div className="text-center py-8">
                <Printer className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No printers found</p>
                <p className="text-sm text-muted-foreground">
                  Make sure your printer is turned on and in pairing mode
                </p>
              </div>
            ) : (
              availablePrinters.map((printer) => (
                <div
                  key={printer.id}
                  className={`flex items-center justify-between p-4 border rounded-lg ${
                    printer.connected ? 'border-green-200 bg-green-50' : 'border-border'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{getPrinterIcon(printer.type)}</div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium">{printer.name}</p>
                        {printer.connected && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{printer.address}</p>
                      {printer.battery && (
                        <div className="flex items-center space-x-1 mt-1">
                          <span className="text-xs text-muted-foreground">Battery:</span>
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${
                              printer.battery > 50 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {printer.battery}%
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {printer.connected ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDisconnectPrinter(printer.id)}
                      >
                        Disconnect
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleConnectPrinter(printer.id)}
                      >
                        Connect
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}

      {/* Print Settings */}
      {connectedPrinter && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Print Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-print receipts</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically print receipt after successful transactions
                </p>
              </div>
              <Switch 
                checked={autoPrint} 
                onCheckedChange={setAutoPrint}
              />
            </div>

            <div className="pt-4 border-t">
              <Button 
                onClick={handleTestPrint}
                className="w-full"
                variant="outline"
              >
                <Zap className="h-4 w-4 mr-2" />
                Print Test Receipt
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Info */}
      <Card className={connectedPrinter ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}>
        <CardContent className="p-4">
          <div className="flex items-start space-x-2">
            {connectedPrinter ? (
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
            ) : (
              <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
            )}
            <div className="text-sm">
              <p className={`font-medium ${connectedPrinter ? 'text-green-900' : 'text-yellow-900'}`}>
                {connectedPrinter ? 'Printer Connected' : 'No Printer Connected'}
              </p>
              <p className={connectedPrinter ? 'text-green-700' : 'text-yellow-700'}>
                {connectedPrinter 
                  ? 'You can now print receipts for your transactions.' 
                  : 'Connect a printer to enable receipt printing functionality.'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Troubleshooting */}
      <Card>
        <CardHeader>
          <CardTitle>Troubleshooting</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Printer not found?</h4>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Make sure the printer is turned on</li>
              <li>• Put the printer in pairing/discoverable mode</li>
              <li>• Check if printer is already connected to another device</li>
              <li>• Restart both devices and try again</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Print quality issues?</h4>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Check paper alignment in the printer</li>
              <li>• Replace thermal paper if faded</li>
              <li>• Clean printer head if necessary</li>
              <li>• Check battery level on portable printers</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}