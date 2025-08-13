// Firebase Cloud Functions for Bix Mobil Vest
// Project: dulpton-point
// Deploy with: firebase deploy --only functions

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');

// Initialize Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();

// Configure functions for your project region (us-central1 is default)
const regionalFunctions = functions.region('us-central1');

// Paystack integration
exports.initializePaystackPayment = regionalFunctions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { amount, email, userId, metadata } = data;

  try {
    // Log the payment initialization for debugging
    console.log('Initializing Paystack payment:', { amount, email, userId });

    const response = await axios.post('https://api.paystack.co/transaction/initialize', {
      amount,
      email,
      metadata: {
        ...metadata,
        userId,
        source: 'bix-mobil-vest'
      },
      callback_url: `https://dulpton-point.web.app/payment-callback`,
      channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer']
    }, {
      headers: {
        Authorization: `Bearer ${functions.config().paystack.secret_key}`,
        'Content-Type': 'application/json'
      }
    });

    // Log successful response
    console.log('Paystack response:', response.data);

    return {
      success: true,
      reference: response.data.data.reference,
      authorizationUrl: response.data.data.authorization_url,
      accessCode: response.data.data.access_code
    };
  } catch (error) {
    console.error('Paystack initialization error:', error.response?.data || error.message);
    throw new functions.https.HttpsError('internal', 'Payment initialization failed');
  }
});

// Flutterwave integration
exports.initializeFlutterwavePayment = regionalFunctions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { amount, email, userId, metadata } = data;

  try {
    console.log('Initializing Flutterwave payment:', { amount, email, userId });

    const response = await axios.post('https://api.flutterwave.com/v3/payments', {
      tx_ref: `BIX_${Date.now()}_${userId}`,
      amount: amount / 100, // Flutterwave uses naira, not kobo
      currency: 'NGN',
      redirect_url: `https://dulpton-point.web.app/payment-callback`,
      customer: {
        email,
        name: metadata.name || 'Bix User'
      },
      customizations: {
        title: 'Bix Mobil Vest',
        description: 'Wallet Top-up',
        logo: 'https://dulpton-point.web.app/logo.png'
      },
      meta: {
        userId,
        source: 'bix-mobil-vest',
        ...metadata
      }
    }, {
      headers: {
        Authorization: `Bearer ${functions.config().flutterwave.secret_key}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Flutterwave response:', response.data);

    return {
      success: true,
      reference: response.data.data.tx_ref,
      authorizationUrl: response.data.data.link
    };
  } catch (error) {
    console.error('Flutterwave initialization error:', error.response?.data || error.message);
    throw new functions.https.HttpsError('internal', 'Payment initialization failed');
  }
});

// Verify payment
exports.verifyPayment = regionalFunctions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { reference, provider } = data;

  try {
    console.log('Verifying payment:', { reference, provider });

    let response;
    
    if (provider === 'paystack') {
      response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: {
          Authorization: `Bearer ${functions.config().paystack.secret_key}`
        }
      });
      
      const paymentData = response.data.data;
      console.log('Paystack verification result:', paymentData);
      
      if (paymentData.status === 'success') {
        // Update user wallet balance
        const userRef = db.collection('users').doc(paymentData.metadata.userId);
        await userRef.update({
          walletBalance: admin.firestore.FieldValue.increment(paymentData.amount / 100),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        return {
          success: true,
          reference,
          data: {
            amount: paymentData.amount,
            userId: paymentData.metadata.userId,
            email: paymentData.customer.email
          }
        };
      }
    } else if (provider === 'flutterwave') {
      response = await axios.get(`https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${reference}`, {
        headers: {
          Authorization: `Bearer ${functions.config().flutterwave.secret_key}`
        }
      });
      
      const paymentData = response.data.data;
      console.log('Flutterwave verification result:', paymentData);
      
      if (paymentData.status === 'successful') {
        // Update user wallet balance
        const userRef = db.collection('users').doc(paymentData.meta.userId);
        await userRef.update({
          walletBalance: admin.firestore.FieldValue.increment(paymentData.amount),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        return {
          success: true,
          reference,
          data: {
            amount: paymentData.amount * 100, // Convert back to kobo
            userId: paymentData.meta.userId,
            email: paymentData.customer.email
          }
        };
      }
    }

    return { success: false, reference, message: 'Payment not successful' };
  } catch (error) {
    console.error('Payment verification error:', error.response?.data || error.message);
    throw new functions.https.HttpsError('internal', 'Payment verification failed');
  }
});

// Purchase recharge cards
exports.purchaseRechargeCards = regionalFunctions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { network, denomination, quantity, userId } = data;

  try {
    console.log('Purchasing recharge cards:', { network, denomination, quantity, userId });

    // Check user wallet balance
    const userDoc = await db.collection('users').doc(userId).get();
    const user = userDoc.data();
    const totalCost = denomination * quantity * 0.98; // 2% discount for bulk purchase

    if (!user || user.walletBalance < totalCost) {
      throw new functions.https.HttpsError('failed-precondition', 'Insufficient wallet balance');
    }

    // In production, integrate with actual network APIs
    // For now, generate mock cards
    const cards = [];
    for (let i = 0; i < quantity; i++) {
      cards.push({
        pin: generateRechargePin(network, denomination),
        serial: generateSerialNumber(network)
      });
    }

    // Deduct from wallet
    await db.collection('users').doc(userId).update({
      walletBalance: admin.firestore.FieldValue.increment(-totalCost),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Log transaction
    await db.collection('transactions').add({
      userId,
      type: 'recharge_card_purchase',
      network,
      denomination,
      quantity,
      amount: totalCost,
      status: 'completed',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      metadata: { cards: cards.length }
    });

    console.log('Cards purchased successfully');

    return {
      success: true,
      reference: `CARD_${Date.now()}_${userId}`,
      cards,
      totalCost
    };
  } catch (error) {
    console.error('Card purchase error:', error);
    throw new functions.https.HttpsError('internal', error.message || 'Card purchase failed');
  }
});

// Purchase data bundle
exports.purchaseDataBundle = regionalFunctions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { network, plan, phoneNumber, userId, amount } = data;

  try {
    console.log('Purchasing data bundle:', { network, plan, phoneNumber, userId, amount });

    // Check user wallet balance
    const userDoc = await db.collection('users').doc(userId).get();
    const user = userDoc.data();

    if (!user || user.walletBalance < amount) {
      throw new functions.https.HttpsError('failed-precondition', 'Insufficient wallet balance');
    }

    // In production, integrate with actual data bundle APIs
    // For now, simulate successful purchase

    // Deduct from wallet
    await db.collection('users').doc(userId).update({
      walletBalance: admin.firestore.FieldValue.increment(-amount),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Log transaction
    await db.collection('transactions').add({
      userId,
      type: 'data_bundle_purchase',
      network,
      plan,
      phoneNumber,
      amount,
      status: 'completed',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('Data bundle purchased successfully');
    
    return {
      success: true,
      reference: `DATA_${Date.now()}_${userId}`,
      message: `${plan} data successfully sent to ${phoneNumber}`
    };
  } catch (error) {
    console.error('Data purchase error:', error);
    throw new functions.https.HttpsError('internal', error.message || 'Data purchase failed');
  }
});

// Get available data plans
exports.getDataPlans = regionalFunctions.https.onCall(async (data, context) => {
  const { network } = data;

  // Mock data plans - in production, fetch from network APIs
  const plans = {
    'MTN': [
      { id: 'mtn_1gb_30', name: '1GB - 30 Days', amount: 1000, validity: '30 days' },
      { id: 'mtn_2gb_30', name: '2GB - 30 Days', amount: 2000, validity: '30 days' },
      { id: 'mtn_5gb_30', name: '5GB - 30 Days', amount: 4500, validity: '30 days' },
      { id: 'mtn_10gb_30', name: '10GB - 30 Days', amount: 8000, validity: '30 days' }
    ],
    'GLO': [
      { id: 'glo_1gb_30', name: '1GB - 30 Days', amount: 1000, validity: '30 days' },
      { id: 'glo_2gb_30', name: '2GB - 30 Days', amount: 2000, validity: '30 days' },
      { id: 'glo_5gb_30', name: '5GB - 30 Days', amount: 4000, validity: '30 days' }
    ],
    'AIRTEL': [
      { id: 'airtel_1gb_30', name: '1GB - 30 Days', amount: 1200, validity: '30 days' },
      { id: 'airtel_2gb_30', name: '2GB - 30 Days', amount: 2200, validity: '30 days' },
      { id: 'airtel_5gb_30', name: '5GB - 30 Days', amount: 4500, validity: '30 days' }
    ],
    '9MOBILE': [
      { id: '9mobile_1gb_30', name: '1GB - 30 Days', amount: 1000, validity: '30 days' },
      { id: '9mobile_2gb_30', name: '2GB - 30 Days', amount: 2000, validity: '30 days' },
      { id: '9mobile_5gb_30', name: '5GB - 30 Days', amount: 4200, validity: '30 days' }
    ]
  };

  return {
    success: true,
    plans: plans[network] || []
  };
});

// Utility functions
function generateRechargePin(network, denomination) {
  const prefixes = { 
    'MTN': { 100: '5555', 200: '5556', 500: '5557', 1000: '5558' },
    'GLO': { 100: '6666', 200: '6667', 500: '6668', 1000: '6669' },
    'AIRTEL': { 100: '7777', 200: '7778', 500: '7779', 1000: '7780' },
    '9MOBILE': { 100: '8888', 200: '8889', 500: '8890', 1000: '8891' }
  };
  
  const prefix = prefixes[network]?.[denomination] || '9999';
  const suffix = Math.random().toString().slice(2, 14);
  return prefix + suffix.padEnd(12, '0');
}

function generateSerialNumber(network) {
  const networkPrefixes = {
    'MTN': 'MTN',
    'GLO': 'GLO',
    'AIRTEL': 'AIR',
    '9MOBILE': '9MB'
  };
  
  const prefix = networkPrefixes[network] || 'GEN';
  const suffix = Math.random().toString(36).substring(2, 12).toUpperCase();
  return `${prefix}${suffix}`;
}

// Webhook handlers for payment confirmations
exports.paystackWebhook = regionalFunctions.https.onRequest(async (req, res) => {
  try {
    console.log('Paystack webhook received:', req.body);
    
    // Verify webhook signature
    const hash = crypto.createHmac('sha512', functions.config().paystack.secret_key)
      .update(JSON.stringify(req.body))
      .digest('hex');
    
    if (hash === req.headers['x-paystack-signature']) {
      const event = req.body;
      
      if (event.event === 'charge.success') {
        // Handle successful payment
        console.log('Payment successful:', event.data);
        // Additional processing if needed
      }
    }
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('Paystack webhook error:', error);
    res.status(500).send('Error');
  }
});

exports.flutterwaveWebhook = regionalFunctions.https.onRequest(async (req, res) => {
  try {
    console.log('Flutterwave webhook received:', req.body);
    
    // Verify webhook signature
    const secretHash = functions.config().flutterwave.webhook_secret;
    const signature = req.headers['verif-hash'];
    
    if (signature === secretHash) {
      const event = req.body;
      
      if (event.status === 'successful') {
        // Handle successful payment
        console.log('Payment successful:', event);
        // Additional processing if needed
      }
    }
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('Flutterwave webhook error:', error);
    res.status(500).send('Error');
  }
});