const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Razorpay = require('razorpay');

admin.initializeApp();

// ======================= CONFIGURATION =======================
// Razorpay (keys from environment)
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Gemini AI (optional)
let genAI;
try {
  const geminiKey = functions.config().gemini?.key;
  if (geminiKey) genAI = new GoogleGenerativeAI(geminiKey);
} catch(e) {
  console.warn('Gemini not configured');
}

// ======================= 1. AI ASSISTANT =======================
exports.askAI = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Login required');
  if (!genAI) throw new functions.https.HttpsError('failed-precondition', 'AI not configured');
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  const result = await model.generateContent(data.query || 'Hello');
  return { answer: result.response.text() };
});

// ======================= 2. CREATE RAZORPAY ORDER =======================
exports.createRazorpayOrder = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Login required');
  const { amount, currency = 'INR', receipt } = data;
  const options = {
    amount: Math.round(amount),
    currency,
    receipt: receipt || `receipt_${Date.now()}`,
  };
  try {
    const order = await razorpay.orders.create(options);
    return { id: order.id, amount: order.amount, currency: order.currency };
  } catch (err) {
    console.error('Razorpay order error:', err);
    throw new functions.https.HttpsError('internal', 'Unable to create order');
  }
});

// ======================= 3. VERIFY PAYMENT & ADD TO WALLET =======================
exports.verifyPayment = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', '');
  const { amount } = data;
  const walletRef = admin.firestore().collection('wallets').doc(context.auth.uid);
  await walletRef.set({ balance: admin.firestore.FieldValue.increment(amount) }, { merge: true });
  return { success: true };
});

// ======================= 4. CREATE TRADING ROOM =======================
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

// ======================= 5. UPGRADE SUBSCRIPTION =======================
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
