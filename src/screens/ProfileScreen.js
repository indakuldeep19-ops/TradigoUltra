import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { auth } from '../services/firebase';

export default function ProfileScreen() {
  const user = auth.currentUser;
  const logout = () => auth.signOut();
  return (
    <View style={styles.container}>
      <Text style={styles.email}>{user?.email}</Text>
      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'#0A0A0A' },
  email: { color:'#FFF', fontSize:18, marginBottom:20 },
  logoutBtn: { backgroundColor:'#FF4444', padding:12, borderRadius:8 },
  logoutText: { color:'#FFF', fontWeight:'bold' }
});
