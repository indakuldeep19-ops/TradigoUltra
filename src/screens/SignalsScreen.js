import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { API_BASE_URL } from '../config';

export default function SignalsScreen() {
  const [signals, setSignals] = useState([]);
  useEffect(() => {
    fetch(API_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: 'get-signals', data: {} })
    })
      .then(res => res.json())
      .then(data => setSignals(data.signals || []));
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
