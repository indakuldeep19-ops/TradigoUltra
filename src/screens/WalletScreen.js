import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';
import * as WebBrowser from 'expo-web-browser';
// For Razorpay, you'd need to integrate properly; here we use a mock

export default function WalletScreen() {
  const [balances, setBalances] = useState({ USD: 0, BTC: 0, ETH: 0 });
  const [transactions, setTransactions] = useState([]);
  const [withdrawAddr, setWithdrawAddr] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const userId = 'demo'; // replace with real user id

  useEffect(() => { loadWallet(); }, []);

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
    } catch (err) { console.error(err); }
  };

  const deposit = () => {
    Alert.alert('Deposit', 'For demo, you can integrate Razorpay here. After successful payment, the wallet will be updated.');
    // In real app, integrate Razorpay and then call backend to credit funds
  };

  const withdraw = async () => {
    if (!withdrawAddr || !withdrawAmount) return Alert.alert('Error', 'Enter address and amount');
    const token = await AsyncStorage.getItem('token');
    try {
      const res = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: 'withdraw', data: { token, address: withdrawAddr, amount: parseFloat(withdrawAmount) } })
      });
      const data = await res.json();
      if (data.success) Alert.alert('Withdrawal requested', data.message);
      else Alert.alert('Error', data.error);
    } catch (err) { Alert.alert('Network Error', err.message); }
  };

  return (
    <View style={styles.container}>
      <FlatList data={Object.entries(balances)} renderItem={({item}) => (
        <View style={styles.balanceItem}>
          <Text style={styles.currency}>{item[0]}</Text>
          <Text style={styles.amount}>{item[1]}</Text>
        </View>
      )} keyExtractor={item => item[0]} />
      <View style={styles.buttons}>
        <TouchableOpacity style={styles.depositBtn} onPress={deposit}><Text style={styles.btnText}>Deposit</Text></TouchableOpacity>
        <TextInput style={styles.input} placeholder="Withdraw Address" value={withdrawAddr} onChangeText={setWithdrawAddr} />
        <TextInput style={styles.input} placeholder="Amount" value={withdrawAmount} onChangeText={setWithdrawAmount} keyboardType="numeric" />
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
  buttons: { marginTop:20 },
  depositBtn: { backgroundColor:'#FFD700', padding:14, borderRadius:30, alignItems:'center', marginBottom:12 },
  withdrawBtn: { backgroundColor:'#444', padding:14, borderRadius:30, alignItems:'center', marginTop:12 },
  btnText: { color:'#000', fontWeight:'bold', fontSize:16 },
  input: { backgroundColor:'#1A1A1A', color:'#FFF', padding:12, borderRadius:8, marginBottom:12 }
});
