import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { auth, db } from '../services/firebase';
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { API_BASE_URL } from '../config';

export default function CopyTradingScreen() {
  const [masters, setMasters] = useState([]);
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    const fetchMasters = async () => {
      const q = query(collection(db, 'users'), where('isMasterTrader', '==', true));
      const snap = await getDocs(q);
      setMasters(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchMasters();
  }, []);

  const copyTrader = async (masterId, masterName) => {
    Alert.alert('Copy Trading', `You will copy ${masterName}. Profit share: 25% to master, platform fee 2%.`, [
      { text: 'Cancel' },
      { text: 'Agree', onPress: async () => {
          const copyRef = doc(db, 'copyRelations', `${userId}_${masterId}`);
          await setDoc(copyRef, {
            userId, masterId, createdAt: new Date(),
            profitSharePercent: 25, platformFeePercent: 2,
            totalCopiedProfit: 0, totalPlatformFee: 0
          });
          Alert.alert('Copied!', `Now copying ${masterName}`);
      }}
    ]);
  };

  return (
    <View style={styles.container}>
      <FlatList data={masters} renderItem={({item}) => (
        <TouchableOpacity style={styles.card} onPress={() => copyTrader(item.id, item.name)}>
          <Text style={styles.name}>{item.name || item.email}</Text>
          <Text>Win Rate: {item.winRate || 'N/A'}%</Text>
          <Text>Followers: {item.followers || 0}</Text>
          <TouchableOpacity style={styles.copyBtn}><Text style={styles.copyText}>Copy</Text></TouchableOpacity>
        </TouchableOpacity>
      )} keyExtractor={item => item.id} />
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:'#0A0A0A', padding:16 },
  card: { backgroundColor:'#1A1A1A', padding:16, borderRadius:12, marginBottom:12 },
  name: { color:'#FFD700', fontSize:18, fontWeight:'bold' },
  copyBtn: { marginTop:10, backgroundColor:'#FFD700', padding:8, borderRadius:8, alignItems:'center' },
  copyText: { color:'#000', fontWeight:'bold' }
});
