import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { auth } from '../services/firebase';
import { API_BASE_URL } from '../config';
import * as Razorpay from 'expo-razorpay';

export default function CreateRoomScreen({ navigation }) {
  const [roomName, setRoomName] = useState('');
  const [description, setDescription] = useState('');
  const ROOM_FEE = 150; // INR

  const createRoom = async () => {
    if (!roomName) return Alert.alert('Error', 'Room name required');
    try {
      const orderResponse = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: 'create-order',
          data: { amount: ROOM_FEE * 100, currency: 'INR' }
        })
      });
      const order = await orderResponse.json();
      const options = {
        description: 'Create Trading Room',
        currency: 'INR',
        amount: order.amount,
        order_id: order.id,
        key: 'rzp_test_YOUR_KEY_ID',
        name: 'Tradigo Ultra',
        prefill: { email: auth.currentUser?.email },
        theme: { color: '#FFD700' }
      };
      const payment = await Razorpay.pay(options);
      // Payment successful – create room in backend (optional)
      await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: 'create-room',
          data: { roomName, description, paymentId: payment.razorpay_payment_id, ownerId: auth.currentUser?.uid }
        })
      });
      Alert.alert('Success', `Room "${roomName}" created!`);
      navigation.goBack();
    } catch (err) {
      Alert.alert('Payment Failed', err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Room Name</Text>
      <TextInput style={styles.input} value={roomName} onChangeText={setRoomName} />
      <Text style={styles.label}>Description</Text>
      <TextInput style={styles.input} value={description} onChangeText={setDescription} multiline />
      <Text style={styles.feeText}>Creation Fee: ₹{ROOM_FEE}</Text>
      <TouchableOpacity style={styles.createBtn} onPress={createRoom}>
        <Text style={styles.btnText}>Pay & Create Room</Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:'#0A0A0A', padding:16 },
  label: { color:'#FFD700', marginTop:16 },
  input: { backgroundColor:'#1A1A1A', color:'#FFF', padding:12, borderRadius:8, marginTop:8 },
  feeText: { color:'#FFF', marginTop:20, fontSize:16 },
  createBtn: { marginTop:20, backgroundColor:'#FFD700', padding:14, borderRadius:8, alignItems:'center' },
  btnText: { color:'#000', fontWeight:'bold' }
});
