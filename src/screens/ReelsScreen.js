import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, TouchableOpacity } from 'react-native';
import { Video } from 'expo-av';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Localization from 'expo-localization';

const { width, height } = Dimensions.get('window');

// Sample reels – in real app, fetch from backend with language tags
const DEMO_REELS = [
  { id: '1', videoUrl: 'https://www.sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4', user: 'CryptoMaster', likes: 1200, description: 'How to read candlesticks', language: 'en' },
  { id: '2', videoUrl: 'https://www.sample-videos.com/video123/mp4/720/big_buck_bunny_720p_2mb.mp4', user: 'TraderJenny', likes: 3400, description: 'Bullish pattern breakout', language: 'hi' },
];

export default function ReelsScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reels, setReels] = useState(DEMO_REELS.filter(r => r.language === Localization.locale.split('-')[0] || r.language === 'en'));
  const flatListRef = useRef(null);
  const videoRefs = useRef({});

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length) setCurrentIndex(viewableItems[0].index);
  }).current;

  const handleLike = (id) => {
    setReels(prev => prev.map(r => r.id === id ? { ...r, liked: !r.liked, likes: r.liked ? r.likes-1 : r.likes+1 } : r));
  };

  const renderReel = ({ item, index }) => (
    <View style={styles.reelContainer}>
      <Video
        ref={ref => videoRefs.current[item.id] = ref}
        source={{ uri: item.videoUrl }}
        style={styles.video}
        isLooping
        shouldPlay={index === currentIndex}
        resizeMode="cover"
      />
      <View style={styles.overlay}>
        <Text style={styles.user}>{item.user}</Text>
        <Text style={styles.desc}>{item.description}</Text>
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => handleLike(item.id)}>
            <Ionicons name={item.liked ? 'heart' : 'heart-outline'} size={32} color={item.liked ? '#FF4444' : '#FFF'} />
            <Text style={styles.actionText}>{item.likes}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <FlatList ref={flatListRef} data={reels} renderItem={renderReel} keyExtractor={item => item.id} pagingEnabled showsVerticalScrollIndicator={false} onViewableItemsChanged={onViewableItemsChanged} snapToInterval={height} decelerationRate="fast" />
  );
}
const styles = StyleSheet.create({
  reelContainer: { width, height, position:'relative' },
  video: { position:'absolute', top:0, left:0, right:0, bottom:0 },
  overlay: { position:'absolute', bottom:100, left:16, right:70 },
  user: { color:'#FFF', fontSize:16, fontWeight:'bold' },
  desc: { color:'#FFF', marginTop:8 },
  actions: { position:'absolute', right:-50, bottom:0 },
  actionText: { color:'#FFF', textAlign:'center' }
});
