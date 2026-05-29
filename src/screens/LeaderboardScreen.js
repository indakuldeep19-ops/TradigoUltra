import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { API_BASE_URL } from '../config';

export default function LeaderboardScreen() {
  const [leaders, setLeaders] = useState([]);
  useEffect(() => {
    fetch(API_BASE_URL, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ endpoint:'getLeaderboard', data:{} }) })
      .then(res=>res.json()).then(data=>setLeaders(data.leaderboard || []));
  }, []);
  return (
    <View style={styles.container}>
      <FlatList data={leaders} renderItem={({item, index}) => (
        <View style={styles.row}>
          <Text style={styles.rank}>#{index+1}</Text>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.profit}>${item.profit}</Text>
        </View>
      )} keyExtractor={(item,i)=>i.toString()} />
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:'#0A0A0A', padding:16 },
  row: { flexDirection:'row', justifyContent:'space-between', padding:12, borderBottomWidth:1, borderBottomColor:'#333' },
  rank: { color:'#FFD700', fontSize:16, fontWeight:'bold' },
  name: { color:'#FFF', fontSize:16 },
  profit: { color:'#00FF00' }
});
