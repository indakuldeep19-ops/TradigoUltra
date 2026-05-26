import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { auth, db } from '../services/firebase';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import RazorpayCheckout from 'react-native-razorpay';
import { API_BASE_URL } from '../config';

export default function WalletScreen() {
  const [balances, setBalances] = useState({ USD: 12450.75, BTC: 0.25, ETH: 1.25, INR: 100000 });
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    if (userId) {
      getDoc(doc(db, 'wallets', userId)).then(snap => {
        if (snap.exists()) setBalances(snap.data());
      });
    }
  }, [userId]);

  const deposit = async () => {
    try {
      // Create order from backend
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: 'create-order',
          data: { amount: 5000 * 100, currency: 'INR' } // ₹5000
        })
      });
      const order = await response.json();

      var options = {
        description: 'Add funds to wallet',
        currency: 'INR',
        amount: order.amount,
        key: 'rzp_live_Sm9ukMcAM7nPBD',// Replace with your actual Razorpay Key ID
        order_id: order.id,
        name: 'Tradigo Ultra',
        prefill: { email: auth.currentUser?.email },
        theme: { color: '#FFD700' }
      };
      RazorpayCheckout.open(options).then(async (data) => {
        // Payment success – update wallet
        const walletRef = doc(db, 'wallets', userId);
        await updateDoc(walletRef, { USD: increment(5000) });
        Alert.alert('Success', `Deposited $5000. Payment ID: ${data.razorpay_payment_id}`);
        // Refresh balance
        const snap = await getDoc(walletRef);
        if (snap.exists()) setBalances(snap.data());
      }).catch(err => {
        Alert.alert('Error', err.code);
      });
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Could not create order');
    }
  };

  const withdraw = () => Alert.alert('Withdraw', 'Withdrawal feature coming soon');

  return (
    <View style={styles.container}>
      <FlatList
        data={Object.entries(balances)}
        renderItem={({ item }) => (
          <View style={styles.balanceItem}>
            <Text style={styles.currency}>{item[0]}</Text>
            <Text style={styles.amount}>{item[1]}</Text>
          </View>
        )}
        keyExtractor={item => item[0]}
      />
      <View style={styles.buttons}>
        <TouchableOpacity style={styles.depositBtn} onPress={deposit}>
          <Text style={styles.btnText}>Deposit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.withdrawBtn} onPress={withdraw}>
          <Text style={styles.btnText}>Withdraw</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A', padding: 16 },
  balanceItem: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#333' },
  currency: { color: '#FFD700', fontSize: 18 },
  amount: { color: '#FFF', fontSize: 18 },
  buttons: { flexDirection: 'row', marginTop: 20 },
  depositBtn: { flex: 1, backgroundColor: '#FFD700', padding: 14, borderRadius: 8, marginRight: 8, alignItems: 'center' },
  withdrawBtn: { flex: 1, backgroundColor: '#444', padding: 14, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#000', fontWeight: 'bold' }
});
