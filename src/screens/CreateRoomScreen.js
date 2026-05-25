import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { auth, functions } from '../services/firebase';
import { httpsCallable } from 'firebase/functions';
import { ROOM_CREATION_FEE_INR } from '../services/commission';
import RazorpayCheckout from 'react-native-razorpay';

export default function CreateRoomScreen({ navigation }) {
  const [roomName, setRoomName] = useState('');
  const [description, setDescription] = useState('');

  const createRoom = () => {
    if (!roomName) return Alert.alert('Error', 'Room name required');
    var options = {
      description: 'Create Trading Room',
      currency: 'INR',
      amount: ROOM_CREATION_FEE_INR * 100,
      name: 'Tradigo Ultra',
      prefill: { email: auth.currentUser?.email },
      theme: { color: '#FFD700' }
    };
    RazorpayCheckout.open(options).then(async (payment) => {
      const createRoomFn = httpsCallable(functions, 'createTradingRoom');
      const result = await createRoomFn({ roomName, description, paymentId: payment.razorpay_payment_id });
      Alert.alert('Success', `Room created: ${result.data.roomId}`);
      navigation.goBack();
    }).catch(err => Alert.alert('Payment Failed', err.code));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Room Name</Text>
      <TextInput style={styles.input} value={roomName} onChangeText={setRoomName} />
      <Text style={styles.label}>Description</Text>
      <TextInput style={styles.input} value={description} onChangeText={setDescription} multiline />
      <Text style={styles.feeText}>Creation Fee: ₹{ROOM_CREATION_FEE_INR}</Text>
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
