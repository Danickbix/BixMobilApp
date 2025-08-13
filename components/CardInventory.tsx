'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { 
  Package,
  Search,
  Filter,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  Download
} from 'lucide-react';

interface CardInventoryProps {
  onBack: () => void;
}

interface RechargeCard {
  id: string;
  denomination: number;
  pin: string;
  serialNumber: string;
  network: string;
  status: 'printed' | 'sold' | 'used';
  generatedAt: string;
  soldAt?: string;
}

const networkLogos: { [key: string]: string } = {
  mtn: '🟡',
  glo: '🟢',
  airtel: '🔴',
  '9mobile': '🟢'
};

export function CardInventory({ onBack }: CardInventoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Mock inventory data
  const [inventory, setInventory] = useState<RechargeCard[]>([
    {
      id: '1',
      denomination: 1000,
      pin: '123456789012',
      serialNumber: 'MTN240112001',
      network: 'mtn',
      status: 'printed',
      generatedAt: '2024-01-12T10:30:00Z'
    },
    {
      id: '2',
      denomination: 500,
      pin: '987654321098',
      serialNumber: 'MTN240112002',
      network: 'mtn',
      status: 'sold',
      generatedAt: '2024-01-12T10:30:00Z',
      soldAt: '2024-01-12T14:45:00Z'
    },
    {
      id: '3',
      denomination: 200,
      pin: '456789012345',
      serialNumber: 'GLO240112003',
      network: 'glo',
      status: 'used',
      generatedAt: '2024-01-11T09:15:00Z',
      soldAt: '2024-01-11T16:20:00Z'
    },
    {
      id: '4',
      denomination: 1000,
      pin: '111222333444',
      serialNumber: 'AIR240112004',
      network: 'airtel',
      status: 'printed',
      generatedAt: '2024-01-12T11:00:00Z'
    },
    {
      id: '5',
      denomination: 500,
      pin: '555666777888',
      serialNumber: '9MB240112005',
      network: '9mobile',
      status: 'sold',
      generatedAt: '2024-01-12T12:30:00Z',
      soldAt: '2024-01-12T15:10:00Z'
    }
  ]);

  const filteredCards = inventory.filter(card => {
    const matchesSearch = card.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         card.pin.includes(searchTerm);
    const matchesNetwork = selectedNetwork === 'all' || card.network === selectedNetwork;
    const matchesStatus = selectedStatus === 'all' || card.status === selectedStatus;
    
    return matchesSearch && matchesNetwork && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'printed':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'sold':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'used':
        return <XCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'printed':
        return 'bg-blue-100 text-blue-800';
      case 'sold':
        return 'bg-green-100 text-green-800';
      case 'used':
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getInventoryStats = () => {
    const stats = {
      total: inventory.length,
      printed: inventory.filter(c => c.status === 'printed').length,
      sold: inventory.filter(c => c.status === 'sold').length,
      used: inventory.filter(c => c.status === 'used').length,
      totalValue: inventory
        .filter(c => c.status === 'printed')
        .reduce((sum, c) => sum + c.denomination, 0)
    };
    return stats;
  };

  const stats = getInventoryStats();

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <Package className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Card Inventory</h1>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total Cards</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.printed}</p>
            <p className="text-xs text-muted-foreground">Available</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.sold}</p>
            <p className="text-xs text-muted-foreground">Sold</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-lg font-bold">₦{stats.totalValue.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Available Value</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by serial number or PIN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
          
          <div className="flex space-x-3">
            <select
              value={selectedNetwork}
              onChange={(e) => setSelectedNetwork(e.target.value)}
              className="flex-1 p-2 border border-border rounded-md bg-background text-sm"
            >
              <option value="all">All Networks</option>
              <option value="mtn">MTN</option>
              <option value="glo">GLO</option>
              <option value="airtel">AIRTEL</option>
              <option value="9mobile">9MOBILE</option>
            </select>
            
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="flex-1 p-2 border border-border rounded-md bg-background text-sm"
            >
              <option value="all">All Status</option>
              <option value="printed">Available</option>
              <option value="sold">Sold</option>
              <option value="used">Used</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Cards List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Cards ({filteredCards.length})</CardTitle>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredCards.length === 0 ? (
            <div className="p-8 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No cards found matching your criteria</p>
            </div>
          ) : (
            <div className="space-y-0">
              {filteredCards.map((card, index) => (
                <div
                  key={card.id}
                  className={`flex items-center justify-between p-4 ${
                    index !== filteredCards.length - 1 ? 'border-b' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{networkLogos[card.network]}</span>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium">₦{card.denomination.toLocaleString()}</p>
                        {getStatusIcon(card.status)}
                      </div>
                      <p className="text-xs text-muted-foreground">{card.serialNumber}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {card.pin.substring(0, 4)}****{card.pin.substring(8)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right space-y-1">
                    <Badge variant="secondary" className={getStatusColor(card.status)}>
                      {card.status.toUpperCase()}
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      {new Date(card.generatedAt).toLocaleDateString()}
                    </p>
                    {card.soldAt && (
                      <p className="text-xs text-green-600">
                        Sold: {new Date(card.soldAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}