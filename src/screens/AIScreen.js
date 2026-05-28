import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { API_BASE_URL } from '../config';
import { BlurView } from 'expo-blur';

export default function AIScreen() {
  const [messages, setMessages] = useState([{ id: '1', text: 'Hello! I am your AI trading assistant. Ask me anything about crypto!', sender: 'ai' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

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
        body: JSON.stringify({ endpoint: 'ask-ai', data: { query: input } })
      });
      const result = await response.json();
      const aiMsg = { id: (Date.now()+1).toString(), text: result.answer, sender: 'ai' };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      setMessages(prev => [...prev, { id: (Date.now()+1).toString(), text: 'Sorry, AI is unavailable.', sender: 'ai' }]);
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        renderItem={({item}) => (
          <View style={[styles.msgContainer, item.sender === 'user' ? styles.userMsg : styles.aiMsg]}>
            <BlurView intensity={80} tint="dark" style={styles.bubble}>
              <Text style={styles.msgText}>{item.text}</Text>
            </BlurView>
          </View>
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
      />
      {loading && <ActivityIndicator size="large" color="#FFD700" style={styles.loader} />}
      <View style={styles.inputContainer}>
        <TextInput style={styles.input} value={input} onChangeText={setInput} placeholder="Ask Gemini AI..." placeholderTextColor="#888" />
        <TouchableOpacity style={styles.sendBtn} onPress={askAI}><Text style={styles.sendText}>Send</Text></TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:'#0A0A0A' },
  list: { padding: 16, paddingBottom: 80 },
  msgContainer: { marginBottom: 16, flexDirection: 'row' },
  userMsg: { justifyContent: 'flex-end' },
  aiMsg: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '80%', padding: 12, borderRadius: 20, overflow: 'hidden' },
  userBubble: { backgroundColor: '#FFD700' },
  aiBubble: { backgroundColor: '#1A1A1A' },
  msgText: { color: '#FFF', fontSize: 14 },
  loader: { marginVertical: 10 },
  inputContainer: { flexDirection:'row', padding: 16, backgroundColor: '#1A1A1A', borderTopWidth: 1, borderTopColor: '#333' },
  input: { flex:1, backgroundColor:'#2A2A2A', color:'#FFF', padding:12, borderRadius:30, fontSize:16 },
  sendBtn: { backgroundColor:'#FFD700', marginLeft:12, paddingHorizontal:20, borderRadius:30, justifyContent:'center' },
  sendText: { color:'#000', fontWeight:'bold' }
});
