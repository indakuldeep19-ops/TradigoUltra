import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { db } from '../services/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function SignalsScreen() {
  const [signals, setSignals] = useState([]);
  useEffect(() => {
    getDocs(collection(db, 'signals')).then(snap => setSignals(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
  }, []);
  return (
    <View style={styles.container}>
      <FlatList data={signals} renderItem={({item}) => (
        <View style={styles.card}>
          <Text style={styles.symbol}>{item.symbol}</Text>
          <Text style={[styles.action, item.action === 'BUY' ? styles.buy : styles.sell]}>{item.action}</Text>
          <Text>Entry: ${item.entryPrice}</Text>
          <Text>Target: ${item.targetPrice}</Text>
          <Text>Stop: ${item.stopLoss}</Text>
          <Text>Confidence: {item.confidence}%</Text>
        </View>
      )} keyExtractor={item => item.id} />
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:'#0A0A0A', padding:16 },
  card: { backgroundColor:'#1A1A1A', padding:16, borderRadius:12, marginBottom:12 },
  symbol: { color:'#FFD700', fontSize:18, fontWeight:'bold' },
  action: { fontSize:16, fontWeight:'bold' },
  buy: { color:'#00FF00' },
  sell: { color:'#FF4444' }
});
