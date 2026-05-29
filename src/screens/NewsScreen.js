import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { API_BASE_URL } from '../config';

export default function NewsScreen() {
  const [news, setNews] = useState([]);
  useEffect(() => {
    fetch(API_BASE_URL, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ endpoint:'getNews', data:{} }) })
      .then(res=>res.json()).then(data=>setNews(data.news || []));
  }, []);
  return (
    <View style={styles.container}>
      <FlatList data={news} renderItem={({item}) => (
        <TouchableOpacity style={styles.card} onPress={() => Linking.openURL(item.link)}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.date}>{item.pubDate}</Text>
        </TouchableOpacity>
      )} keyExtractor={(item,i)=>i.toString()} />
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:'#0A0A0A', padding:16 },
  card: { backgroundColor:'#1A1A1A', padding:12, borderRadius:12, marginBottom:12 },
  title: { color:'#FFF', fontSize:16 },
  date: { color:'#888', fontSize:12, marginTop:4 }
});
