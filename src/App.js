import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import TradeScreen from './screens/TradeScreen';
import ReelsScreen from './screens/ReelsScreen';
import AIScreen from './screens/AIScreen';
import ProfileScreen from './screens/ProfileScreen';
import WalletScreen from './screens/WalletScreen';
import SignalsScreen from './screens/SignalsScreen';
import CopyTradingScreen from './screens/CopyTradingScreen';
import CreateRoomScreen from './screens/CreateRoomScreen';
import SubscriptionScreen from './screens/SubscriptionScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          const icons = {
            Home: 'home', Trade: 'swap-horizontal', Reels: 'play-circle',
            AI: 'chatbubble-ellipses', Wallet: 'wallet', Signals: 'trending-up',
            CopyTrade: 'people', CreateRoom: 'add-circle', Subscribe: 'card'
          };
          return <Icon name={icons[route.name]} size={size} color={color} />;
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
