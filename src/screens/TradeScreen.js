import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import axios from 'axios';
import { auth } from '../services/firebase';
import { deductTradeCommission } from '../services/commission';

const { width } = Dimensions.get('window');

export default function TradeScreen({ route }) {
  const { symbol = 'BTCUSDT' } = route.params || {};
  const [price, setPrice] = useState(0);
  const [change24h, setChange24h] = useState(0);
  const [chartData, setChartData] = useState([0]);
  const [amount, setAmount] = useState('');
  const [orderType, setOrderType] = useState('market');
  const [limitPrice, setLimitPrice] = useState('');
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 5000);
    return () => clearInterval(interval);
  }, [symbol]);

  const fetchMarketData = async () => {
    try {
      const res = await axios.get(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`);
      setPrice(parseFloat(res.data.lastPrice));
      setChange24h(parseFloat(res.data.priceChangePercent));
      const candles = await axios.get(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1h&limit=20`);
      const closes = candles.data.map(candle => parseFloat(candle[4]));
      setChartData(closes);
    } catch (error) { console.error(error); }
  };

  const executeTrade = async (type) => {
    if (!amount) return Alert.alert('Error', 'Enter amount');
    const amountUsd = parseFloat(amount);
    const fee = await deductTradeCommission(userId, amountUsd, type, symbol);
    Alert.alert('Trade Executed', `${type} ${amountUsd} USD of ${symbol}\nCommission: $${fee.toFixed(2)}`);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.symbol}>{symbol}</Text>
      <Text style={styles.price}>${price.toFixed(2)}</Text>
      <Text style={change24h >= 0 ? styles.positive : styles.negative}>{change24h >= 0 ? '+' : ''}{change24h.toFixed(2)}%</Text>
      <LineChart data={{ datasets: [{ data: chartData }] }} width={width-32} height={220} chartConfig={{ backgroundColor: '#1A1A1A', backgroundGradientFrom: '#1A1A1A', backgroundGradientTo: '#0A0A0A', color: (opacity=1)=>`rgba(255,215,0,${opacity})`, labelColor: ()=>'#FFF' }} bezier style={styles.chart} />
      <View style={styles.orderTypeContainer}>
        <TouchableOpacity style={[styles.orderTypeBtn, orderType==='market' && styles.active]} onPress={()=>setOrderType('market')}><Text>Market</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.orderTypeBtn, orderType==='limit' && styles.active]} onPress={()=>setOrderType('limit')}><Text>Limit</Text></TouchableOpacity>
      </View>
      <TextInput style={styles.input} placeholder="Amount (USD)" value={amount} onChangeText={setAmount} keyboardType="numeric" />
      {orderType === 'limit' && <TextInput style={styles.input} placeholder="Limit Price" value={limitPrice} onChangeText={setLimitPrice} keyboardType="numeric" />}
      <View style={styles.buttons}>
        <TouchableOpacity style={[styles.tradeBtn, {backgroundColor:'#00FF00'}]} onPress={()=>executeTrade('Buy')}><Text style={styles.btnText}>BUY</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.tradeBtn, {backgroundColor:'#FF4444'}]} onPress={()=>executeTrade('Sell')}><Text style={styles.btnText}>SELL</Text></TouchableOpacity>
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:'#0A0A0A', padding:16 },
  symbol: { color:'#FFD700', fontSize:24, fontWeight:'bold', textAlign:'center' },
  price: { color:'#FFF', fontSize:36, fontWeight:'bold', textAlign:'center' },
  positive: { color:'#00FF00', textAlign:'center' },
  negative: { color:'#FF4444', textAlign:'center' },
  chart: { marginVertical:20, borderRadius:16 },
  orderTypeContainer: { flexDirection:'row', justifyContent:'center', marginBottom:20 },
  orderTypeBtn: { paddingHorizontal:20, paddingVertical:8, marginHorizontal:10, backgroundColor:'#333', borderRadius:20 },
  active: { backgroundColor:'#FFD700' },
  input: { backgroundColor:'#1A1A1A', color:'#FFF', padding:12, borderRadius:8, marginBottom:16, borderWidth:1, borderColor:'#FFD70030' },
  buttons: { flexDirection:'row', justifyContent:'space-between' },
  tradeBtn: { flex:1, padding:14, borderRadius:8, alignItems:'center', marginHorizontal:8 },
  btnText: { color:'#000', fontWeight:'bold', fontSize:18 }
});
