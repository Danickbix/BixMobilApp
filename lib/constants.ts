// Network configurations
export const NETWORKS = {
  mtn: { id: 'mtn', name: 'MTN', logo: '🟡', commission: '2%' },
  glo: { id: 'glo', name: 'GLO', logo: '🟢', commission: '2.5%' },
  airtel: { id: 'airtel', name: 'AIRTEL', logo: '🔴', commission: '2%' },
  '9mobile': { id: '9mobile', name: '9MOBILE', logo: '🟢', commission: '1.8%' }
} as const;

export const NETWORK_LOGOS = {
  mtn: '🟡',
  glo: '🟢', 
  airtel: '🔴',
  '9mobile': '🟢'
} as const;

// Recharge card denominations
export const DENOMINATIONS = [100, 200, 500, 1000, 2000, 5000] as const;

// Data bundle configurations
export const DATA_BUNDLES = {
  mtn: [
    { size: '500MB', price: 300, validity: '7 days' },
    { size: '1GB', price: 500, validity: '30 days' },
    { size: '2GB', price: 1000, validity: '30 days' },
    { size: '5GB', price: 2500, validity: '30 days' },
    { size: '10GB', price: 5000, validity: '30 days' }
  ],
  glo: [
    { size: '1GB', price: 450, validity: '30 days' },
    { size: '2GB', price: 900, validity: '30 days' },
    { size: '3GB', price: 1350, validity: '30 days' },
    { size: '5GB', price: 2250, validity: '30 days' },
    { size: '10GB', price: 4500, validity: '30 days' }
  ],
  airtel: [
    { size: '500MB', price: 350, validity: '7 days' },
    { size: '1GB', price: 550, validity: '30 days' },
    { size: '2GB', price: 1100, validity: '30 days' },
    { size: '5GB', price: 2750, validity: '30 days' },
    { size: '10GB', price: 5500, validity: '30 days' }
  ],
  '9mobile': [
    { size: '750MB', price: 400, validity: '7 days' },
    { size: '1.5GB', price: 600, validity: '30 days' },
    { size: '2GB', price: 1200, validity: '30 days' },
    { size: '4.5GB', price: 2700, validity: '30 days' },
    { size: '11GB', price: 6000, validity: '30 days' }
  ]
} as const;

// Quick action configurations
export const QUICK_ACTIONS = [
  {
    id: 'airtime',
    title: 'Buy Airtime',
    subtitle: 'Direct recharge',
    icon: 'Smartphone',
    color: 'bg-green-100 text-green-600'
  },
  {
    id: 'data',
    title: 'Data Bundles',
    subtitle: 'Internet plans',
    icon: 'Wifi',
    color: 'bg-blue-100 text-blue-600'
  },
  {
    id: 'print-cards',
    title: 'Print Cards',
    subtitle: 'Recharge vouchers',
    icon: 'CreditCard',
    color: 'bg-primary/10 text-primary'
  },
  {
    id: 'bills',
    title: 'Pay Bills',
    subtitle: 'Utilities & more',
    icon: 'FileText',
    color: 'bg-purple-100 text-purple-600'
  }
] as const;