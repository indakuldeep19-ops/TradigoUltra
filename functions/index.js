const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Razorpay = require('razorpay');
require('dotenv').config();

admin.initializeApp();

// Razorpay instance (keys from environment)
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Gemini AI instance (set your key via firebase functions:config:set gemini.key="your_key")
let genAI;
try {
  const geminiKey = functions.config().gemini?.key;
  if (geminiKey) {
    genAI = new GoogleGenerativeAI(geminiKey);
  } else {
    console.warn("Gemini API key not set. AI features will be disabled.");
  }
} catch (e) {
  console.warn("Gemini config not available.");
}

// ========== AI Assistant ==========
exports.askAI = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Login required');
  if (!genAI) throw new functions.https.HttpsError('failed-precondition', 'AI service not configured');
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const result = await model.generateContent(data.query || "Hello");
  return { answer: result.response.text() };
});

// ========== Create Razorpay Order ==========
exports.createRazorpayOrder = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Login required');
  const { amount, currency = 'INR', receipt } = data;
  const options = {
    amount: Math.round(amount), // amount in paise / smallest currency unit
    currency,
    receipt: receipt || `receipt_${Date.now()}`,
  };
  try {
    const order = await razorpay.orders.create(options);
    return { id: order.id, amount: order.amount, currency: order.currency };
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    throw new functions.https.HttpsError('internal', 'Unable to create order');
  }
});

// ========== Verify Payment & Add to Wallet ==========
exports.verifyPayment = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', '');
  const { paymentId, orderId, signature, amount } = data;
  // Here you should verify signature using crypto (optional but recommended)
  // For now, we simply add the amount to user's wallet
  const userRef = admin.firestore().collection('wallets').doc(context.auth.uid);
  await userRef.set({ balance: admin.firestore.FieldValue.increment(amount) }, { merge: true });
  return { success: true };
});

// ========== Create Trading Room (after payment) ==========
exports.createTradingRoom = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', '');
  const { roomName, description, paymentId } = data;
  const roomRef = await admin.firestore().collection('tradingRooms').add({
    name: roomName,
    description: description || '',
    ownerId: context.auth.uid,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    members: [context.auth.uid],
    paymentId: paymentId || null,
  });
  return { roomId: roomRef.id };
});

// ========== Upgrade Subscription ==========
exports.upgradeSubscription = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', '');
  const { plan, paymentId } = data;
  let expiry = new Date();
  if (plan === 'premium_monthly') expiry.setMonth(expiry.getMonth() + 1);
  else if (plan === 'premium_quarterly') expiry.setMonth(expiry.getMonth() + 3);
  else if (plan === 'premium_yearly') expiry.setFullYear(expiry.getFullYear() + 1);
  else throw new functions.https.HttpsError('invalid-argument', 'Invalid plan');

  await admin.firestore().collection('users').doc(context.auth.uid).update({
    subscriptionPlan: plan,
    subscriptionValidUntil: expiry,
    lastPaymentId: paymentId,
  });
  return { success: true };
});

// ========== Distribute Copy Trading Profit (trigger) ==========
exports.distributeCopyProfit = functions.firestore
  .document('trades/{tradeId}')
  .onCreate(async (snap, context) => {
    const trade = snap.data();
    if (!trade.isCopyTrade) return;
    const profit = trade.profitAmount;
    if (!profit || profit <= 0) return;
    const copyRelDoc = await admin.firestore().collection('copyRelations').doc(trade.copyRelationId).get();
    if (!copyRelDoc.exists) return;
    const rel = copyRelDoc.data();
    const masterShare = profit * (rel.profitSharePercent / 100);
    const platformFee = masterShare * (rel.platformFeePercent / 100);
    const finalToMaster = masterShare - platformFee;

    const batch = admin.firestore().batch();
    const masterWalletRef = admin.firestore().collection('wallets').doc(rel.masterId);
    const platformWalletRef = admin.firestore().collection('platform').doc('wallet');
    batch.update(masterWalletRef, { balance: admin.firestore.FieldValue.increment(finalToMaster) });
    batch.update(platformWalletRef, { balance: admin.firestore.FieldValue.increment(platformFee) });
    await batch.commit();
  });
