# Bix Mobil Vest 📱

A comprehensive mobile application for recharge card printing and mobile data sales, designed for small business owners, cyber cafés, and phone shops in Nigeria.

## ✨ Features

### Core Functionality
- 🎫 **Recharge Card Printing** - Print MTN, GLO, Airtel, and 9mobile recharge cards
- 📊 **Mobile Data Sales** - Purchase and manage data bundles
- 💰 **Wallet Management** - Top-up wallet with multiple payment methods
- 📈 **Sales Tracking** - Monitor sales history and commissions
- 🧾 **Receipt Generation** - Generate receipts via Bluetooth printers
- 🔔 **Push Notifications** - Real-time updates and alerts

### Business Features
- 📱 **Offline Mode** - Print saved codes without internet
- 🏪 **Multi-Business Support** - Cyber cafés, phone shops, retail stores
- 📍 **Location-Based Services** - Nigerian state and city support
- 💼 **Commission Tracking** - Real-time commission calculations
- 📋 **Inventory Management** - Track card inventory and sales

## 🚀 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 + Shadcn/ui
- **Backend**: Firebase (Auth, Firestore, Functions)
- **Payments**: Paystack & Flutterwave integration
- **State Management**: React Context + Custom hooks
- **Icons**: Lucide React
- **Animations**: Motion/React
- **PWA**: Vite PWA plugin

## 📋 Prerequisites

- Node.js 18+ and npm 8+
- Firebase account and project
- Paystack/Flutterwave API keys (for payments)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/bixmobilvest/mobile-app.git
   cd mobile-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Firebase Setup**
   ```bash
   # Install Firebase CLI
   npm install -g firebase-tools
   
   # Login to Firebase
   firebase login
   
   # Initialize Firebase project
   firebase init
   ```

4. **Environment Configuration**
   
   Create `.env.local` file:
   ```env
   # Firebase Configuration
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   
   # Payment Gateway Keys
   VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_key
   VITE_FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-your_flutterwave_key
   
   # App Configuration
   VITE_APP_NAME="Bix Mobil Vest"
   VITE_APP_VERSION="1.0.0"
   VITE_COMMISSION_RATE=0.025
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run preview         # Preview production build
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint issues
npm run type-check      # TypeScript type checking

# Firebase
npm run firebase:emulators    # Start Firebase emulators
npm run firebase:deploy       # Deploy to Firebase
npm run firebase:functions:deploy  # Deploy only functions

# Testing
npm run test            # Run tests
npm run test:ui         # Run tests with UI

# Maintenance
npm run clean           # Clean build artifacts
```

## 📱 Mobile Features

### Responsive Design
- Mobile-first approach with 375px container
- Safe area support for modern devices
- Touch-friendly interface

### PWA Support
- Offline functionality
- App-like experience
- Push notifications
- Install prompt

### Business Types Supported
- 🖥️ Cyber Cafés
- 📱 Phone Shops
- 🏪 Retail Stores
- 🏢 Other businesses

## 🌍 Nigerian Market Focus

### Network Providers
- MTN Nigeria
- GLO (Globacom)
- Airtel Nigeria
- 9mobile

### Payment Methods
- Bank Transfer
- Card Payments (Paystack)
- USSD Payments
- Mobile Money

### Geographic Coverage
- All 36 Nigerian states + FCT
- Major cities support
- Local currency (NGN)

## 🔐 Security Features

- Firebase Authentication
- Secure API endpoints
- PCI-compliant payments
- Data encryption
- Rate limiting

## 📊 Business Intelligence

### Analytics Dashboard
- Sales metrics
- Commission tracking
- Popular products
- Customer insights

### Reporting
- Daily sales reports
- Monthly summaries
- Commission statements
- Transaction history

## 🛡️ Error Handling

- Comprehensive error boundaries
- User-friendly error messages
- Automatic retry mechanisms
- Offline fallbacks

## 🚀 Deployment

### Firebase Hosting
```bash
npm run build
firebase deploy
```

### PWA Deployment
The app automatically builds as a PWA with:
- Service worker for caching
- Offline functionality
- Install prompts
- App manifests

## 📖 Documentation

- [Firebase Setup Guide](./FIREBASE_SETUP.md)
- [Payment Integration](./docs/payments.md)
- [API Documentation](./docs/api.md)
- [Component Library](./docs/components.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- Email: support@bixmobilvest.com
- Website: https://bixmobilvest.com
- Issues: [GitHub Issues](https://github.com/bixmobilvest/mobile-app/issues)

## 🙏 Acknowledgments

- [Shadcn/ui](https://ui.shadcn.com/) for the component library
- [Firebase](https://firebase.google.com/) for backend services
- [Paystack](https://paystack.com/) and [Flutterwave](https://flutterwave.com/) for payment processing
- Nigerian telecom providers for API access

---

**Made with ❤️ for Nigerian businesses**