import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { API_BASE_URL } from '../config';

export default function SignalsScreen() {
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSignals();
  }, []);

  const fetchSignals = async () => {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: 'get-signals',
          data: {}
        })
      });
      const result = await response.json();
      setSignals(result.signals || []);
    } catch (error) {
      console.error('Error fetching signals:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

  if (signals.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No signals available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={signals}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.symbol}>{item.symbol || 'N/A'}</Text>
            <Text
              style={[
                styles.action,
                item.action === 'BUY' ? styles.buy : item.action === 'SELL' ? styles.sell : styles.hold
              ]}
            >
              {item.action || 'HOLD'}
            </Text>
            <Text style={styles.detail}>Entry: ${item.entryPrice || '-'}</Text>
            <Text style={styles.detail}>Target: ${item.targetPrice || '-'}</Text>
            <Text style={styles.detail}>Stop Loss: ${item.stopLoss || '-'}</Text>
            <Text style={styles.detail}>Confidence: {item.confidence || 0}%</Text>
            {item.reasoning && <Text style={styles.reasoning}>{item.reasoning}</Text>}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A', padding: 16 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A0A0A' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A0A0A' },
  emptyText: { color: '#888', fontSize: 16 },
  card: { backgroundColor: '#1A1A1A', padding: 16, borderRadius: 12, marginBottom: 12 },
  symbol: { color: '#FFD700', fontSize: 18, fontWeight: 'bold' },
  action: { fontSize: 16, fontWeight: 'bold', marginVertical: 4 },
  buy: { color: '#00FF00' },
  sell: { color: '#FF4444' },
  hold: { color: '#FFA500' },
  detail: { color: '#FFF', marginTop: 2 },
  reasoning: { color: '#AAA', marginTop: 8, fontStyle: 'italic' }
});
