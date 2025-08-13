export type NetworkId = 'mtn' | 'glo' | 'airtel' | '9mobile';
export type ServiceType = 'airtime' | 'data';
export type TransactionStatus = 'completed' | 'pending' | 'failed';
export type CardStatus = 'generated' | 'printed' | 'sold' | 'used';

export interface Transaction {
  id: string;
  type: ServiceType;
  network: NetworkId;
  phoneNumber: string;
  amount: number;
  commission: number;
  status: TransactionStatus;
  timestamp: string;
  bundle?: DataBundle;
  reference: string;
}

export interface RechargeCard {
  id: string;
  denomination: number;
  pin: string;
  serialNumber: string;
  network: NetworkId;
  status: CardStatus;
  generatedAt: string;
  soldAt?: string;
}

export interface DataBundle {
  size: string;
  price: number;
  validity: string;
}

export interface BluetoothPrinter {
  id: string;
  name: string;
  address: string;
  connected: boolean;
  type: 'thermal' | 'inkjet' | 'unknown';
  battery?: number;
}

export interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  businessName: string;
  businessType?: string;
  verified: boolean;
}