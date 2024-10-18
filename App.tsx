import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './screens/HomeScreen';
import ShopScreen from './screens/ShopScreen';
import SettingsScreen from './screens/SettingsScreen';
import BillingScreen from './screens/BillingScreen';
import StoreScreen from './screens/StoreScreen';
import MatIcon from 'react-native-vector-icons/MaterialIcons';
import LoginScreen from './screens/LoginScreen';
import InsuranceStack from './Navigation/Insurance';
import { useSelector } from 'react-redux';

const Tab = createBottomTabNavigator();

// Move tabBarIcon outside the component
const getTabBarIcon = (routeName: string) => {
  let iconName;

  switch (routeName) {
    case 'Home':
      iconName = 'home';
      break;
    case 'Shop':
      iconName = 'shopping-cart';
      break;
    case 'Insurance':
      iconName = 'local-hospital';
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
      iconName = 'help';
  }

  return (color: string, size: number) => <MatIcon name={iconName} size={size} color={color} />;
};


function App() {
  const user = useSelector((state: any) => state.user.user);

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ color, size }) => getTabBarIcon(route.name)(color, size),
          tabBarActiveTintColor: '#000',
          tabBarInactiveTintColor: 'gray',
        })}
      >
        {user ? (
          <>
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen
              name="Insurance"
              component={InsuranceStack}
              options={({ route }) => ({
                headerShown: true,
                headerTitleAlign: "center",
                headerTitle: "Insurance",
                headerTitleStyle: { fontSize: 28, fontWeight: "bold" },
              })}
            />
            {/* <Tab.Screen name="Insurance" component={InsuranceOptions} /> */}
            <Tab.Screen name="Shop" component={ShopScreen} />
            <Tab.Screen name="Store" component={StoreScreen} />
            <Tab.Screen name="Billing" component={BillingScreen} />
            <Tab.Screen name="Settings" component={SettingsScreen} />
          </>
        ) : (
          <Tab.Screen name="Login" component={LoginScreen} />
        )}

      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default App;
