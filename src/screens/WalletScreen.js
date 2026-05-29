import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';
import * as Razorpay from 'expo-razorpay';

export default function WalletScreen() {
  const [balances, setBalances] = useState({ USD: 0, BTC: 0, ETH: 0 });
  const [withdrawAddr, setWithdrawAddr] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  useEffect(() => {
    loadWallet();
  }, []);

  const loadWallet = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: 'getWallet', data: { token } })
      });
      const data = await res.json();
      if (data.success) setBalances(data.balances);
      else setBalances({ USD: 12450.75, BTC: 0.25, ETH: 1.25 }); // demo
    } catch (err) {
      console.error(err);
      setBalances({ USD: 12450.75, BTC: 0.25, ETH: 1.25 });
    }
  };

  const deposit = async () => {
    try {
      // 1. Create order from backend
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: 'create-order',
          data: { amount: 5000 * 100, currency: 'INR' } // ₹5000 in paise
        })
      });
      const order = await response.json();

      // 2. Open Razorpay checkout
      const options = {
        description: 'Add funds to wallet',
        currency: 'INR',
        amount: order.amount,
        order_id: order.id,
        key: 'rzp_live_Sm9ukMcAM7nPBD', // YOUR KEY ID
        name: 'Tradigo Ultra',
        prefill: {
          email: 'user@example.com', // ideally get from auth
          contact: '9999999999'
        },
        theme: { color: '#FFD700' }
      };

      const paymentData = await Razorpay.pay(options);
      Alert.alert('Success', `Payment ID: ${paymentData.razorpay_payment_id}`);

      // 3. (Optional) Verify payment on backend
      await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: 'verify-payment',
          data: { paymentId: paymentData.razorpay_payment_id, amount: 5000 }
        })
      });

      // Refresh wallet balance
      loadWallet();
    } catch (err) {
      Alert.alert('Payment Failed', err.message || 'Something went wrong');
    }
  };

  const withdraw = async () => {
    if (!withdrawAddr || !withdrawAmount) return Alert.alert('Error', 'Enter address and amount');
    const token = await AsyncStorage.getItem('token');
    try {
      const res = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: 'withdraw',
          data: { token, address: withdrawAddr, amount: parseFloat(withdrawAmount) }
        })
      });
      const data = await res.json();
      if (data.success) Alert.alert('Withdrawal requested', data.message);
      else Alert.alert('Error', data.error);
    } catch (err) {
      Alert.alert('Network Error', err.message);
    }
  };

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
        keyExtractor={(item) => item[0]}
      />
      <View style={styles.buttons}>
        <TouchableOpacity style={styles.depositBtn} onPress={deposit}>
          <Text style={styles.btnText}>Deposit ₹5000</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Withdraw Address"
          value={withdrawAddr}
          onChangeText={setWithdrawAddr}
        />
        <TextInput
          style={styles.input}
          placeholder="Amount"
          value={withdrawAmount}
          onChangeText={setWithdrawAmount}
          keyboardType="numeric"
        />
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
  currency: { color: '#FFD700', fontSize: 18, fontWeight: 'bold' },
  amount: { color: '#FFF', fontSize: 18 },
  buttons: { marginTop: 20 },
  depositBtn: { backgroundColor: '#FFD700', padding: 14, borderRadius: 30, alignItems: 'center', marginBottom: 12 },
  withdrawBtn: { backgroundColor: '#444', padding: 14, borderRadius: 30, alignItems: 'center', marginTop: 12 },
  btnText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
  input: { backgroundColor: '#1A1A1A', color: '#FFF', padding: 12, borderRadius: 8, marginBottom: 12 }
});
