import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Ionicons from '@expo/vector-icons/Ionicons';

import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import TradeScreen from './src/screens/TradeScreen';
import ReelsScreen from './src/screens/ReelsScreen';
import AIScreen from './src/screens/AIScreen';
import WalletScreen from './src/screens/WalletScreen';
import SignalsScreen from './src/screens/SignalsScreen';
import CopyTradingScreen from './src/screens/CopyTradingScreen';
import CreateRoomScreen from './src/screens/CreateRoomScreen';
import SubscriptionScreen from './src/screens/SubscriptionScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Trade') iconName = 'swap-horizontal';
          else if (route.name === 'Reels') iconName = 'play-circle';
          else if (route.name === 'AI') iconName = 'chatbubble-ellipses';
          else if (route.name === 'Wallet') iconName = 'wallet';
          else if (route.name === 'Signals') iconName = 'trending-up';
          else if (route.name === 'CopyTrade') iconName = 'people';
          else if (route.name === 'CreateRoom') iconName = 'add-circle';
          else if (route.name === 'Subscribe') iconName = 'card';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FFD700',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: { backgroundColor: '#000', borderTopColor: '#FFD70020' },
        headerStyle: { backgroundColor: '#000' },
        headerTitleStyle: { color: '#FFD700' }
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Trade" component={TradeScreen} />
      <Tab.Screen name="Reels" component={ReelsScreen} />
      <Tab.Screen name="AI" component={AIScreen} />
      <Tab.Screen name="Wallet" component={WalletScreen} />
      <Tab.Screen name="Signals" component={SignalsScreen} />
      <Tab.Screen name="CopyTrade" component={CopyTradingScreen} options={{ title: 'Copy Trading' }} />
      <Tab.Screen name="CreateRoom" component={CreateRoomScreen} options={{ title: 'Create Room' }} />
      <Tab.Screen name="Subscribe" component={SubscriptionScreen} options={{ title: 'Plans' }} />
    </Tab.Navigator>
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
