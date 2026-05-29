import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { API_BASE_URL } from '../config';

export default function AIScreen() {
  const [messages, setMessages] = useState([{ id: '1', text: 'Hello! I am your AI trading assistant. Ask me anything about crypto trading, buddy trading, or app issues!', sender: 'ai' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const askAI = async () => {
    if (!input.trim()) return;
    const userMsg = { id: Date.now().toString(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      // For real Gemini, you would call a Cloud Function. Here we simulate with a generic answer.
      // Replace with actual Gemini API call if you have key.
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: 'aiChat', data: { query: input } })
      });
      const result = await response.json();
      const aiMsg = { id: (Date.now()+1).toString(), text: result.answer || 'I am currently learning. For now, keep your stop-loss tight and trade wisely!', sender: 'ai' };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      const fallback = "I'm here to help! Remember: always use stop-loss and never risk more than you can afford.";
      setMessages(prev => [...prev, { id: (Date.now()+1).toString(), text: fallback, sender: 'ai' }]);
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <FlatList data={messages} renderItem={({item}) => (
        <View style={[styles.msgBubble, item.sender === 'user' ? styles.userBubble : styles.aiBubble]}>
          <Text style={styles.msgText}>{item.text}</Text>
        </View>
      )} keyExtractor={item => item.id} />
      {loading && <ActivityIndicator size="large" color="#FFD700" />}
      <View style={styles.inputContainer}>
        <TextInput style={styles.input} value={input} onChangeText={setInput} placeholder="Ask AI..." placeholderTextColor="#888" />
        <TouchableOpacity onPress={askAI} style={styles.sendBtn}><Text style={styles.sendText}>Send</Text></TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:'#0A0A0A', padding:16 },
  msgBubble: { maxWidth:'80%', padding:10, borderRadius:10, marginBottom:8 },
  userBubble: { alignSelf:'flex-end', backgroundColor:'#FFD700' },
  aiBubble: { alignSelf:'flex-start', backgroundColor:'#1A1A1A' },
  msgText: { color:'#FFF' },
  inputContainer: { flexDirection:'row', marginTop:10 },
  input: { flex:1, backgroundColor:'#1A1A1A', color:'#FFF', padding:10, borderRadius:20 },
  sendBtn: { backgroundColor:'#FFD700', padding:10, borderRadius:20, marginLeft:8 },
  sendText: { color:'#000', fontWeight:'bold' }
});
