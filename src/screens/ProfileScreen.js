import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  useEffect(() => { loadUser(); }, []);
  const loadUser = async () => {
    const token = await AsyncStorage.getItem('token');
    // You can decode token or fetch user data
    setUser({ email: 'user@example.com', name: 'Demo User', plan: 'basic' });
  };
  const logout = async () => {
    await AsyncStorage.removeItem('token');
    navigation.replace('Login');
  };
  return (
    <View style={styles.container}>
      <Text style={styles.name}>{user?.name}</Text>
      <Text style={styles.email}>{user?.email}</Text>
      <Text>Subscription: {user?.plan}</Text>
      <TouchableOpacity style={styles.logoutBtn} onPress={logout}><Text style={styles.logoutText}>Logout</Text></TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:'#0A0A0A', padding:16, justifyContent:'center', alignItems:'center' },
  name: { color:'#FFD700', fontSize:24, fontWeight:'bold' },
  email: { color:'#FFF', fontSize:16, marginVertical:8 },
  logoutBtn: { marginTop:20, backgroundColor:'#FF4444', padding:12, borderRadius:8 },
  logoutText: { color:'#FFF', fontWeight:'bold' }
});
