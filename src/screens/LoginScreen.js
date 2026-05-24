import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { auth } from '../services/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const handleAuth = async () => {
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      navigation.replace('Main');
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>TRADIGO ULTRA</Text>
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
      <TouchableOpacity style={styles.button} onPress={handleAuth}>
        <Text style={styles.buttonText}>{isLogin ? 'Login' : 'Sign Up'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
        <Text style={styles.switch}>{isLogin ? 'Create account' : 'Already have an account?'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:'#0A0A0A', justifyContent:'center', padding:20 },
  logo: { color:'#FFD700', fontSize:32, fontWeight:'bold', textAlign:'center', marginBottom:40 },
  input: { backgroundColor:'#1A1A1A', color:'#FFF', padding:12, borderRadius:8, marginBottom:16, borderWidth:1, borderColor:'#FFD70030' },
  button: { backgroundColor:'#FFD700', padding:14, borderRadius:8, alignItems:'center' },
  buttonText: { color:'#000', fontWeight:'bold' },
  switch: { color:'#FFD700', textAlign:'center', marginTop:20 }
});
