# Firebase Setup Instructions for Bix Mobil Vest

Your app is now configured to use your Firebase project: **dulpton-point**

## Current Status ✅
- ✅ Firebase project configured
- ✅ Authentication enabled  
- ✅ Firestore database ready
- ✅ Cloud Functions structure ready
- ✅ Analytics enabled

## Next Steps Required

### 1. Enable Firebase Services

In your [Firebase Console](https://console.firebase.google.com/project/dulpton-point):

**Authentication:**
- Go to Authentication > Sign-in method
- Enable Email/Password provider
- Enable Phone provider (for SMS authentication)
- Configure authorized domains if needed

**Firestore Database:**
- Go to Firestore Database
- Create database in production mode
- Set up security rules (see below)

**Cloud Functions:**
- Go to Functions
- Upgrade to Blaze plan (pay-as-you-go) to use external APIs

### 2. Deploy Cloud Functions

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize project (if not done)
firebase init

# Navigate to functions directory
cd firebase-functions

# Install dependencies
npm install

# Set environment configuration
firebase functions:config:set paystack.secret_key="sk_test_your_paystack_secret_key"
firebase functions:config:set flutterwave.secret_key="FLWSECK_TEST-your_flutterwave_secret_key"

# Deploy functions
firebase deploy --only functions
```

### 3. Configure Payment Gateways

**Paystack:**
1. Create account at [Paystack](https://paystack.com)
2. Get your API keys from Dashboard > Settings > API Keys
3. Update in `/lib/config/environment.ts`:
   - Replace `pk_test_xxxxxxxxxx` with your public key
4. Set secret key in Firebase Functions config (see deployment step above)

**Flutterwave:**
1. Create account at [Flutterwave](https://flutterwave.com)
2. Get your API keys from Dashboard > Settings > API
3. Update in `/lib/config/environment.ts`:
   - Replace `FLWPUBK_TEST-xxxxxxxxxx` with your public key
4. Set secret key in Firebase Functions config

### 4. Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can read/write their own transactions
    match /transactions/{transactionId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Users can read/write their own wallet transactions
    match /wallet_transactions/{transactionId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Users can read/write their own card inventory
    match /card_inventory/{inventoryId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
  }
}
```

### 5. Test the Application

1. **Authentication Test:**
   - Try signing up with email/password
   - Try phone number authentication

2. **Payment Test:**
   - Use test cards for Paystack/Flutterwave
   - Verify wallet balance updates

3. **Transaction Test:**
   - Purchase recharge cards
   - Buy data bundles
   - Check transaction history

### 6. Production Checklist

Before going live:
- [ ] Switch to production API keys
- [ ] Update environment from "production" to actual production
- [ ] Set up proper Firebase security rules
- [ ] Configure custom domain
- [ ] Enable logging and monitoring
- [ ] Set up backup policies

## Support

If you encounter issues:
1. Check Firebase Console for errors
2. Review Cloud Functions logs
3. Verify API key configurations
4. Test with small amounts first

## Test Credentials

**Paystack Test Cards:**
- Visa: 4084084084084081
- Mastercard: 5060666666666666666

**Flutterwave Test Cards:**
- Visa: 4187427415564246
- Mastercard: 5531886652142950

Use any future date for expiry and any 3-digit CVV.