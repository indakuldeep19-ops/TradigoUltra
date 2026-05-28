import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { auth, db } from '../services/firebase';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import * as Razorpay from 'expo-razorpay';
import { API_BASE_URL } from '../config';

export default function WalletScreen() {
  const [balances, setBalances] = useState({ USD: 12450.75, BTC: 0.25, ETH: 1.25 });
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    if (userId) getDoc(doc(db, 'wallets', userId)).then(snap => { if(snap.exists()) setBalances(snap.data()); });
  }, []);

  const deposit = async () => {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: 'create-order', data: { amount: 5000 * 100, currency: 'INR' } })
      });
      const order = await response.json();
      const options = {
        description: 'Add funds to wallet',
        currency: 'INR',
        amount: order.amount,
        order_id: order.id,
        key: 'rzp_test_YOUR_KEY_ID', // replace with your actual Razorpay test key
        name: 'Tradigo Ultra',
        prefill: { email: auth.currentUser?.email, contact: '9999999999' },
        theme: { color: '#FFD700' }
      };
      const paymentData = await Razorpay.pay(options);
      Alert.alert('Success', `Payment ID: ${paymentData.razorpay_payment_id}`);
      // After payment, update wallet in Firestore
      await updateDoc(doc(db, 'wallets', userId), { USD: increment(5000) });
      setBalances(prev => ({ ...prev, USD: prev.USD + 5000 }));
    } catch (err) { Alert.alert('Error', err.message); }
  };

  const withdraw = () => Alert.alert('Withdraw', 'Coming soon');

  return (
    <View style={styles.container}>
      <FlatList data={Object.entries(balances)} renderItem={({item}) => (
        <View style={styles.balanceItem}>
          <Text style={styles.currency}>{item[0]}</Text>
          <Text style={styles.amount}>${item[1].toLocaleString()}</Text>
        </View>
      )} keyExtractor={item => item[0]} />
      <View style={styles.buttons}>
        <TouchableOpacity style={styles.depositBtn} onPress={deposit}><Text style={styles.btnText}>Deposit</Text></TouchableOpacity>
        <TouchableOpacity style={styles.withdrawBtn} onPress={withdraw}><Text style={styles.btnText}>Withdraw</Text></TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:'#0A0A0A', padding:16 },
  balanceItem: { flexDirection:'row', justifyContent:'space-between', padding:16, borderBottomWidth:1, borderBottomColor:'#333' },
  currency: { color:'#FFD700', fontSize:18, fontWeight:'bold' },
  amount: { color:'#FFF', fontSize:18 },
  buttons: { flexDirection:'row', marginTop:20, gap: 16 },
  depositBtn: { flex:1, backgroundColor:'#FFD700', padding:14, borderRadius:30, alignItems:'center' },
  withdrawBtn: { flex:1, backgroundColor:'#444', padding:14, borderRadius:30, alignItems:'center' },
  btnText: { color:'#000', fontWeight:'bold', fontSize:16 }
});
