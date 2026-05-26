import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { auth, functions } from '../services/firebase';
import { API_BASE_URL } from '../config';
import * as Razorpay from 'expo-razorpay';

export default function SubscriptionScreen() {
  const subscribe = async (planName, price) => {
    try {
      const orderRes = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: 'create-order', data: { amount: price * 100, currency: 'INR' } })
      });
      const order = await orderRes.json();
      const options = {
        description: `Upgrade to ${planName}`,
        currency: 'INR',
        amount: order.amount,
        order_id: order.id,
        key: 'rzp_test_YOUR_KEY_ID',
        name: 'Tradigo Ultra',
        prefill: { email: auth.currentUser?.email },
        theme: { color: '#FFD700' }
      };
      await Razorpay.pay(options);
      // Optionally update subscription in Firestore
      Alert.alert('Success', 'Subscription activated!');
    } catch (err) {
      Alert.alert('Error', err.message);
    }
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
      <TouchableOpacity style={styles.subscribeBtn} onPress={() => subscribe('Premium Monthly', 399)}>
        <Text style={styles.btnText}>Premium Monthly – ₹399</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.subscribeBtn} onPress={() => subscribe('Premium Quarterly', 599)}>
        <Text style={styles.btnText}>Premium Quarterly – ₹599</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.subscribeBtn} onPress={() => subscribe('Premium Yearly', 999)}>
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
