import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './screens/HomeScreen';
import ShopScreen from './screens/ShopScreen';
import SettingsScreen from './screens/SettingsScreen';
import BillingScreen from './screens/BillingScreen';
import StoreScreen from './screens/StoreScreen';
import MatIcon from 'react-native-vector-icons/MaterialIcons';

const Tab = createBottomTabNavigator();

// Move tabBarIcon outside the component
const getTabBarIcon = (routeName: string) => {
  let iconName: string;

  switch (routeName) {
    case 'Home':
      iconName = 'home';
      break;
    case 'Shop':
      iconName = 'shopping-cart';
      break;
    case 'Store':
      iconName = 'store';
      break;
    case 'Billing':
      iconName = 'calculate';
      break;
    case 'Settings':
      iconName = 'settings';
      break;
    default:
      iconName = 'help'; // fallback icon in case none of the names match
  }

  return (color: string, size: number) => <MatIcon name={iconName} size={size} color={color} />;
};

function App(): React.JSX.Element {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => getTabBarIcon(route.name)(color, size),
          tabBarActiveTintColor: '#000',
          tabBarInactiveTintColor: 'gray',
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Shop" component={ShopScreen} />
        <Tab.Screen name="Store" component={StoreScreen} />
        <Tab.Screen name="Billing" component={BillingScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default App;
