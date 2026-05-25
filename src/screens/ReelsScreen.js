import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, TouchableOpacity } from 'react-native';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');
const DEMO_REELS = [
  { id: '1', videoUrl: 'https://www.sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4', user: 'CryptoMaster', likes: 1200, description: 'How to read candlesticks' },
  { id: '2', videoUrl: 'https://www.sample-videos.com/video123/mp4/720/big_buck_bunny_720p_2mb.mp4', user: 'TraderJenny', likes: 3400, description: 'Bullish pattern breakout' },
];

export default function ReelsScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reels, setReels] = useState(DEMO_REELS);
  const flatListRef = useRef(null);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length) setCurrentIndex(viewableItems[0].index);
  }).current;

  const handleLike = (id) => {
    setReels(prev => prev.map(r => r.id === id ? { ...r, liked: !r.liked, likes: r.liked ? r.likes-1 : r.likes+1 } : r));
  };

  const renderReel = ({ item, index }) => (
    <View style={styles.reelContainer}>
      <Video source={{ uri: item.videoUrl }} style={styles.video} paused={index !== currentIndex} repeat resizeMode="cover" />
      <View style={styles.overlay}>
        <Text style={styles.user}>{item.user}</Text>
        <Text style={styles.desc}>{item.description}</Text>
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => handleLike(item.id)}>
            <Icon name={item.liked ? 'heart' : 'heart-outline'} size={32} color={item.liked ? '#FF4444' : '#FFF'} />
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
