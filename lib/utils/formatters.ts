import type { CardStatus, TransactionStatus } from '../types';

// Format currency amounts
export const formatCurrency = (amount: number): string => {
  return `₦${amount.toLocaleString()}`;
};

// Format dates for display
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString();
};

export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString();
};

// Get status colors for badges
export const getStatusColor = (status: TransactionStatus | CardStatus): string => {
  const statusColors = {
    // Transaction statuses
    completed: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    failed: 'bg-red-100 text-red-800',
    
    // Card statuses
    generated: 'bg-blue-100 text-blue-800',
    printed: 'bg-blue-100 text-blue-800',
    sold: 'bg-green-100 text-green-800',
    used: 'bg-gray-100 text-gray-800'
  };
  
  return statusColors[status] || 'bg-gray-100 text-gray-800';
};

// Mask sensitive data like PINs
export const maskPin = (pin: string): string => {
  if (pin.length <= 4) return pin;
  return `${pin.substring(0, 4)}****${pin.substring(pin.length - 4)}`;
};

export const maskPinShort = (pin: string): string => {
  if (pin.length <= 4) return pin;
  return `${pin.substring(0, 4)}***`;
};