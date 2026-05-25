import { auth, db } from './firebase';
import { doc, updateDoc, increment, getDoc, setDoc } from 'firebase/firestore';

export const TRADE_COMMISSION_PERCENT = 5.5; // 5-6% fixed at 5.5%
export const COPY_PROFIT_SHARE_TO_MASTER = 25; // 20-30%, fixed at 25%
export const PLATFORM_SHARE_OF_COPY_PROFIT = 2; // platform takes 2% of master's share
export const ROOM_CREATION_FEE_INR = 150; // ₹100-200 fixed at ₹150

export const SUBSCRIPTION_PLANS = {
  basic: { price: 0, name: 'Basic', tradeFee: 5.5, copyFee: 25, roomFee: 150 },
  premium_monthly: { price: 399, name: 'Premium Monthly', tradeFee: 2, copyFee: 15, roomFee: 0 },
  premium_quarterly: { price: 599, name: 'Premium Quarterly', tradeFee: 2, copyFee: 15, roomFee: 0 },
  premium_yearly: { price: 999, name: 'Premium Yearly', tradeFee: 2, copyFee: 15, roomFee: 0 }
};

export const getUserPlan = async (userId) => {
  const docRef = doc(db, 'users', userId);
  const snap = await getDoc(docRef);
  return snap.data()?.subscriptionPlan || 'basic';
};

export const deductTradeCommission = async (userId, tradeAmount, tradeType, symbol) => {
  const plan = await getUserPlan(userId);
  const feePercent = SUBSCRIPTION_PLANS[plan]?.tradeFee || TRADE_COMMISSION_PERCENT;
  const fee = (tradeAmount * feePercent) / 100;
  const commissionRef = doc(db, 'commissions', `${userId}_${Date.now()}`);
  await setDoc(commissionRef, {
    userId, tradeAmount, fee, tradeType, symbol, plan, timestamp: new Date()
  });
  const platformWalletRef = doc(db, 'platform', 'wallet');
  await updateDoc(platformWalletRef, { balance: increment(fee) });
  return fee;
};
