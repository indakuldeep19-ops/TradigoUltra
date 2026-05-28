import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { auth, db } from '../services/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import axios from 'axios';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [portfolio, setPortfolio] = useState({ total: 12450.75, change: 8.45 });
  const [marketData, setMarketData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchMarket();
    const user = auth.currentUser;
    if (user) return onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      if (docSnap.exists()) setPortfolio(docSnap.data().portfolio || { total: 12450.75, change: 8.45 });
    });
  }, []);

  const fetchMarket = async () => {
    try {
      const res = await axios.get('https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT');
      setMarketData([{ symbol: 'BTC', price: parseFloat(res.data.lastPrice), change: parseFloat(res.data.priceChangePercent) }]);
    } catch (error) { console.error(error); }
  };

  const onRefresh = async () => { setRefreshing(true); await fetchMarket(); setRefreshing(false); };

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFD700" />}>
      <BlurView intensity={80} tint="dark" style={styles.portfolioCard}>
        <Text style={styles.portfolioLabel}>Total Portfolio Value</Text>
        <Text style={styles.portfolioValue}>${portfolio.total.toLocaleString()}</Text>
        <View style={styles.changeRow}>
          <Ionicons name="trending-up" size={20} color="#00FF00" />
          <Text style={styles.portfolioChange}>+{portfolio.change}% (24h)</Text>
        </View>
      </BlurView>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Market Overview</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.marketScroll}>
          {marketData.map((coin, idx) => (
            <TouchableOpacity key={idx} style={styles.marketCard}>
              <Text style={styles.marketSymbol}>{coin.symbol}</Text>
              <Text style={styles.marketPrice}>${coin.price.toLocaleString()}</Text>
              <Text style={coin.change >= 0 ? styles.green : styles.red}>{coin.change >= 0 ? '+' : ''}{coin.change}%</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <TouchableOpacity style={styles.aiCard}>
        <View style={styles.aiHeader}>
          <Ionicons name="bulb-outline" size={24} color="#FFD700" />
          <Text style={styles.aiTitle}>AI Market Insight</Text>
        </View>
        <Text style={styles.aiText}>Bitcoin showing bullish divergence on RSI. Consider accumulation zone $64k-$65k.</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  portfolioCard: { margin: 16, padding: 20, borderRadius: 24, overflow: 'hidden', backgroundColor: 'rgba(0,0,0,0.7)', borderWidth: 1, borderColor: '#FFD70040' },
  portfolioLabel: { color: '#888', fontSize: 14 },
  portfolioValue: { color: '#FFD700', fontSize: 42, fontWeight: 'bold', marginTop: 8 },
  changeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  portfolioChange: { color: '#00FF00', marginLeft: 6, fontSize: 14 },
  section: { marginVertical: 16 },
  sectionTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold', marginLeft: 16, marginBottom: 12 },
  marketScroll: { paddingLeft: 16 },
  marketCard: { backgroundColor: '#1A1A1A', padding: 16, borderRadius: 20, marginRight: 12, width: 140, borderWidth: 1, borderColor: '#333' },
  marketSymbol: { color: '#FFD700', fontSize: 16, fontWeight: 'bold' },
  marketPrice: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginTop: 6 },
  green: { color: '#00FF00', marginTop: 4 },
  red: { color: '#FF4444', marginTop: 4 },
  aiCard: { backgroundColor: '#1A1A1A', margin: 16, padding: 16, borderRadius: 20, borderWidth: 1, borderColor: '#FFD70040' },
  aiHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  aiTitle: { color: '#FFD700', fontSize: 18, fontWeight: 'bold', marginLeft: 8 },
  aiText: { color: '#CCC', fontSize: 14, lineHeight: 20 }
});
