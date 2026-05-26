import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { functions } from '../services/firebase';
import { httpsCallable } from 'firebase/functions';

export default function AIScreen() {
  const [messages, setMessages] = useState([{ id: '1', text: 'Hello! I am your AI trading assistant. Ask me anything about crypto!', sender: 'ai' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const askAI = async () => {
    
import { API_BASE_URL } from '../config';

const askAI = async () => {
  if (!input.trim()) return;
  const userMsg = { id: Date.now().toString(), text: input, sender: 'user' };
  setMessages(prev => [...prev, userMsg]);
  setInput('');
  setLoading(true);
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint: 'ask-ai',
        data: { query: input }
      })
    });
    const result = await response.json();
    const aiMsg = { id: (Date.now()+1).toString(), text: result.answer, sender: 'ai' };
    setMessages(prev => [...prev, aiMsg]);
  } catch (err) {
    setMessages(prev => [...prev, { id: (Date.now()+1).toString(), text: 'Error: AI unavailable', sender: 'ai' }]);
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
      {loading && <ActivityIndicator size="small" color="#FFD700" />}
      <View style={styles.inputContainer}>
        <TextInput style={styles.input} value={input} onChangeText={setInput} placeholder="Ask Gemini AI..." placeholderTextColor="#888" />
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
