const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { GoogleGenerativeAI } = require('@google/generative-ai');

admin.initializeApp();
const genAI = new GoogleGenerativeAI(functions.config().gemini.key);

// AI Assistant
exports.askAI = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', '');
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const result = await model.generateContent(data.query);
  return { answer: result.response.text() };
});

// Create trading room after payment
exports.createTradingRoom = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', '');
  const { roomName, description, paymentId } = data;
  const roomRef = await admin.firestore().collection('tradingRooms').add({
    name: roomName, description, ownerId: context.auth.uid,
    createdAt: new Date(), members: [context.auth.uid], paymentId
  });
  return { roomId: roomRef.id };
});

// Upgrade subscription
exports.upgradeSubscription = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', '');
  const { plan, paymentId } = data;
  const expiry = new Date();
  if (plan === 'premium_monthly') expiry.setMonth(expiry.getMonth() + 1);
  else if (plan === 'premium_quarterly') expiry.setMonth(expiry.getMonth() + 3);
  else if (plan === 'premium_yearly') expiry.setFullYear(expiry.getFullYear() + 1);
  await admin.firestore().collection('users').doc(context.auth.uid).update({
    subscriptionPlan: plan, subscriptionValidUntil: expiry
  });
  return { success: true };
});

// Distribute copy trading profit (triggered on trade profit)
exports.distributeCopyProfit = functions.firestore
  .document('trades/{tradeId}')
  .onCreate(async (snap, context) => {
    const trade = snap.data();
    if (!trade.isCopyTrade) return;
    const profit = trade.profitAmount;
    if (profit <= 0) return;
    const copyRel = await admin.firestore().collection('copyRelations').doc(trade.copyRelationId).get();
    if (!copyRel.exists) return;
    const rel = copyRel.data();
    const masterShare = profit * (rel.profitSharePercent / 100);
    const platformFee = masterShare * (rel.platformFeePercent / 100);
    const finalToMaster = masterShare - platformFee;
    await admin.firestore().collection('wallets').doc(rel.masterId).update({
      balance: admin.firestore.FieldValue.increment(finalToMaster)
    });
    await admin.firestore().collection('platform').doc('wallet').update({
      balance: admin.firestore.FieldValue.increment(platformFee)
    });
  });
