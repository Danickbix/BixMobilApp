import type { NetworkId } from '../types';

// Generate a 12-digit PIN for recharge cards
export const generatePIN = (): string => {
  return Math.floor(100000000000 + Math.random() * 900000000000).toString();
};

// Generate a unique serial number for recharge cards
export const generateSerialNumber = (network: NetworkId): string => {
  const prefix = network.toUpperCase().substring(0, 3);
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${timestamp}${random}`;
};

// Generate a transaction reference
export const generateTransactionReference = (): string => {
  return `BX${Date.now().toString().slice(-8)}`;
};

// Calculate commission based on amount and network
export const calculateCommission = (amount: number, network: NetworkId): number => {
  const commissionRates: Record<NetworkId, number> = {
    mtn: 0.02,
    glo: 0.025,
    airtel: 0.02,
    '9mobile': 0.018
  };
  
  return amount * (commissionRates[network] || 0.02);
};