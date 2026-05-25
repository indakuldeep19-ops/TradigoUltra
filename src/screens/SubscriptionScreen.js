import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { auth, functions } from '../services/firebase';
import { httpsCallable } from 'firebase/functions';
import { SUBSCRIPTION_PLANS } from '../services/commission';
import RazorpayCheckout from 'react-native-razorpay';

export default function SubscriptionScreen() {
  const subscribe = async (planKey, price) => {
    var options = {
      description: `Upgrade to ${SUBSCRIPTION_PLANS[planKey].name}`,
      currency: 'INR',
      amount: price * 100,
      name: 'Tradigo Ultra',
      prefill: { email: auth.currentUser?.email },
      theme: { color: '#FFD700' }
    };
    RazorpayCheckout.open(options).then(async (payment) => {
      const upgradeFn = httpsCallable(functions, 'upgradeSubscription');
      await upgradeFn({ plan: planKey, paymentId: payment.razorpay_payment_id });
      Alert.alert('Success', 'Subscription activated!');
    }).catch(err => Alert.alert('Payment failed', err.code));
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.planName}>Basic</Text>
        <Text style={styles.price}>FREE</Text>
        <Text>• Trading fee: 5.5%</Text>
        <Text>• Copy fee: 25% profit share</Text>
        <Text>• Room fee: ₹150</Text>
      </View>
      <TouchableOpacity style={styles.subscribeBtn} onPress={() => subscribe('premium_monthly', 399)}>
        <Text style={styles.btnText}>Premium Monthly – ₹399</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.subscribeBtn} onPress={() => subscribe('premium_quarterly', 599)}>
        <Text style={styles.btnText}>Premium Quarterly – ₹599</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.subscribeBtn} onPress={() => subscribe('premium_yearly', 999)}>
        <Text style={styles.btnText}>Premium Yearly – ₹999</Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:'#0A0A0A', padding:16 },
  card: { backgroundColor:'#1A1A1A', padding:20, borderRadius:12, marginBottom:20 },
  planName: { color:'#FFD700', fontSize:24, fontWeight:'bold' },
  price: { color:'#FFF', fontSize:20, marginVertical:8 },
  subscribeBtn: { backgroundColor:'#FFD700', padding:14, borderRadius:8, marginBottom:12, alignItems:'center' },
  btnText: { color:'#000', fontWeight:'bold' }
});
