import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { auth, db } from '../services/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export default function HomeScreen({ navigation }) {
  const [portfolio, setPortfolio] = useState({ total: 12450.75, change: 8.45 });
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    return onSnapshot(doc(db, 'users', user.uid), (doc) => {
      if (doc.exists()) setPortfolio(doc.data().portfolio || { total: 12450.75, change: 8.45 });
    });
  }, []);
  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.label}>Total Portfolio Value</Text>
        <Text style={styles.value}>${portfolio.total.toLocaleString()}</Text>
        <Text style={styles.change}>+{portfolio.change}% (24h)</Text>
      </View>
      <TouchableOpacity style={styles.aiCard} onPress={() => navigation.navigate('AI')}>
        <Text style={styles.aiText}>🤖 AI Insight: Bitcoin showing bullish divergence</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:'#0A0A0A', padding:16 },
  card: { backgroundColor:'#1A1A1A', padding:20, borderRadius:20, borderColor:'#FFD70030', borderWidth:1, marginBottom:16 },
  label: { color:'#888' },
  value: { color:'#FFD700', fontSize:36, fontWeight:'bold' },
  change: { color:'#00FF00', marginTop:8 },
  aiCard: { backgroundColor:'#1A1A1A', padding:16, borderRadius:12 },
  aiText: { color:'#FFD700' }
});
