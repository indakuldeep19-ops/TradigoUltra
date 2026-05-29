import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ImageBackground } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) return Alert.alert('Error', 'Please fill all fields');
    setLoading(true);
    try {
      const endpoint = isLogin ? 'login' : 'register';
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint,
          data: { email, password, name: email.split('@')[0] }
        })
      });
      const result = await response.json();
      if (result.success) {
        if (isLogin) await AsyncStorage.setItem('token', result.token);
        navigation.replace('Main');
      } else {
        Alert.alert('Error', result.error || 'Authentication failed');
      }
    } catch (err) {
      Alert.alert('Network Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground source={{ uri: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800' }} style={styles.background} resizeMode="cover">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.logo}>TRADIGO</Text>
          <Text style={styles.subLogo}>ULTRA</Text>
          <Text style={styles.welcome}>{isLogin ? 'Welcome Back!' : 'Create Account'}</Text>
          <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#aaa" value={email} onChangeText={setEmail} autoCapitalize="none" />
          <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#aaa" secureTextEntry value={password} onChangeText={setPassword} />
          <TouchableOpacity style={styles.button} onPress={handleAuth} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? 'Please wait...' : (isLogin ? 'Login' : 'Sign Up')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
            <Text style={styles.switchText}>{isLogin ? 'New user? Create account' : 'Already have an account? Login'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, width: '100%', height: '100%' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
  card: { width: '85%', backgroundColor: 'rgba(20,20,20,0.95)', borderRadius: 30, padding: 25, borderWidth: 1, borderColor: '#FFD70030', shadowColor: '#FFD700', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10 },
  logo: { color: '#FFD700', fontSize: 40, fontWeight: 'bold', textAlign: 'center', letterSpacing: 2 },
  subLogo: { color: '#FFF', fontSize: 18, textAlign: 'center', marginBottom: 20, letterSpacing: 4 },
  welcome: { color: '#FFF', fontSize: 22, marginBottom: 20, textAlign: 'center' },
  input: { backgroundColor: '#1A1A1A', color: '#FFF', padding: 14, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#FFD70030', fontSize: 16 },
  button: { backgroundColor: '#FFD700', padding: 14, borderRadius: 30, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#000', fontWeight: 'bold', fontSize: 18 },
  switchText: { color: '#FFD700', textAlign: 'center', marginTop: 20, fontSize: 14 }
});
