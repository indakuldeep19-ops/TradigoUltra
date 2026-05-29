import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';

export default function BuddyScreen() {
  const [buddyEmail, setBuddyEmail] = useState('');
  const [buddies, setBuddies] = useState([]);
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mirrorMode, setMirrorMode] = useState(false);

  useEffect(() => { loadBuddyData(); }, []);

  const loadBuddyData = async () => {
    setLoading(true);
    const token = await AsyncStorage.getItem('token');
    try {
      const res = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: 'getBuddyFeed', data: { token } })
      });
      const data = await res.json();
      if (data.success) {
        setBuddies(data.buddies);
        setFeed(data.buddyTrades);
      }
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const inviteBuddy = async () => {
    if (!buddyEmail) return Alert.alert('Error', 'Enter buddy email');
    const token = await AsyncStorage.getItem('token');
    setLoading(true);
    try {
      const res = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: 'inviteBuddy', data: { token, buddyEmail } })
      });
      const data = await res.json();
      if (data.success) Alert.alert('Invite sent', data.message);
      else Alert.alert('Error', data.error);
    } catch (err) { Alert.alert('Network Error', err.message); }
    setLoading(false);
    setBuddyEmail('');
  };

  const mirrorTrade = async (tradeData) => {
    const token = await AsyncStorage.getItem('token');
    try {
      const res = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: 'mirrorTrade', data: { token, buddyEmail: tradeData.user, tradeData } })
      });
      const data = await res.json();
      if (data.success) Alert.alert('Mirror trade placed', `Commission: ${data.commission}`);
      else Alert.alert('Error', data.error);
    } catch (err) { Alert.alert('Network Error', err.message); }
  };

  const renderBuddy = ({ item }) => (
    <View style={styles.buddyCard}>
      <Text style={styles.buddyEmail}>{item.user1 === item.user2 ? item.user2 : item.user1}</Text>
      <Text>Status: {item.status}</Text>
    </View>
  );

  const renderFeedItem = ({ item }) => (
    <View style={styles.feedItem}>
      <Text>{item.user} {item.type} {item.amount} USD of {item.symbol}</Text>
      {mirrorMode && <TouchableOpacity style={styles.mirrorBtn} onPress={() => mirrorTrade(item)}><Text>Mirror this trade</Text></TouchableOpacity>}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Buddy Trading (3% commission)</Text>
      <View style={styles.mirrorRow}>
        <Text>Mirror Mode: </Text>
        <TouchableOpacity onPress={() => setMirrorMode(!mirrorMode)} style={[styles.mirrorToggle, mirrorMode && styles.mirrorActive]}>
          <Text>{mirrorMode ? 'ON' : 'OFF'}</Text>
        </TouchableOpacity>
      </View>

      <TextInput style={styles.input} placeholder="Buddy's Email" value={buddyEmail} onChangeText={setBuddyEmail} />
      <TouchableOpacity style={styles.inviteBtn} onPress={inviteBuddy} disabled={loading}>
        <Text>Invite Buddy</Text>
      </TouchableOpacity>

      <Text style={styles.subtitle}>Your Buddies</Text>
      <FlatList data={buddies} renderItem={renderBuddy} keyExtractor={(item,idx) => idx.toString()} horizontal showsHorizontalScrollIndicator={false} style={styles.buddyList} />

      <Text style={styles.subtitle}>Buddy Trades Feed</Text>
      <FlatList data={feed} renderItem={renderFeedItem} keyExtractor={(item,idx) => idx.toString()} />
      {loading && <ActivityIndicator size="large" color="#FFD700" />}
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:'#0A0A0A', padding:16 },
  title: { color:'#FFD700', fontSize:22, fontWeight:'bold', marginBottom:16 },
  input: { backgroundColor:'#1A1A1A', color:'#FFF', padding:12, borderRadius:8, marginBottom:16 },
  inviteBtn: { backgroundColor:'#FFD700', padding:12, borderRadius:8, alignItems:'center', marginBottom:20 },
  subtitle: { color:'#FFF', fontSize:18, marginVertical:12 },
  buddyList: { marginBottom:20 },
  buddyCard: { backgroundColor:'#1A1A1A', padding:10, borderRadius:12, marginRight:12 },
  buddyEmail: { color:'#FFD700' },
  feedItem: { backgroundColor:'#1A1A1A', padding:12, borderRadius:8, marginBottom:8 },
  mirrorBtn: { marginTop:8, backgroundColor:'#FFD700', padding:6, borderRadius:6, alignSelf:'flex-start' },
  mirrorRow: { flexDirection:'row', alignItems:'center', marginBottom:16 },
  mirrorToggle: { paddingHorizontal:12, paddingVertical:4, backgroundColor:'#333', borderRadius:20 },
  mirrorActive: { backgroundColor:'#00FF00' }
});
