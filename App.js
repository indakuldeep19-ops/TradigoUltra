import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StatusBar } from 'expo-status-bar';

import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import TradeScreen from './src/screens/TradeScreen';
import ReelsScreen from './src/screens/ReelsScreen';
import AIScreen from './src/screens/AIScreen';
import WalletScreen from './src/screens/WalletScreen';
import SignalsScreen from './src/screens/SignalsScreen';
import BuddyScreen from './src/screens/BuddyScreen';
import LeaderboardScreen from './src/screens/LeaderboardScreen';
import NewsScreen from './src/screens/NewsScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  return (
    <>
      <StatusBar style="light" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size, focused }) => {
            let iconName;
            if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
            else if (route.name === 'Trade') iconName = focused ? 'swap-horizontal' : 'swap-horizontal-outline';
            else if (route.name === 'Reels') iconName = focused ? 'play-circle' : 'play-circle-outline';
            else if (route.name === 'AI') iconName = focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline';
            else if (route.name === 'Wallet') iconName = focused ? 'wallet' : 'wallet-outline';
            else if (route.name === 'Signals') iconName = focused ? 'trending-up' : 'trending-up-outline';
            else if (route.name === 'Buddy') iconName = focused ? 'people' : 'people-outline';
            else if (route.name === 'Leaderboard') iconName = focused ? 'trophy' : 'trophy-outline';
            else if (route.name === 'News') iconName = focused ? 'newspaper' : 'newspaper-outline';
            else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#FFD700',
          tabBarInactiveTintColor: '#666',
          tabBarStyle: { backgroundColor: '#000000', borderTopColor: '#FFD70020', height: 60, paddingBottom: 5 },
          headerStyle: { backgroundColor: '#000000' },
          headerTitleStyle: { color: '#FFD700', fontWeight: 'bold' },
          headerShadowVisible: false,
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Dashboard' }} />
        <Tab.Screen name="Trade" component={TradeScreen} />
        <Tab.Screen name="Reels" component={ReelsScreen} />
        <Tab.Screen name="AI" component={AIScreen} options={{ title: 'AI Assistant' }} />
        <Tab.Screen name="Wallet" component={WalletScreen} />
        <Tab.Screen name="Signals" component={SignalsScreen} />
        <Tab.Screen name="Buddy" component={BuddyScreen} options={{ title: 'Buddy Trading' }} />
        <Tab.Screen name="Leaderboard" component={LeaderboardScreen} />
        <Tab.Screen name="News" component={NewsScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
    }
