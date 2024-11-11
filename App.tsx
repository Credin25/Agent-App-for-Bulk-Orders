import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './screens/HomeScreen';
import ShopScreen from './screens/ShopScreen';
import BillingScreen from './screens/BillingScreen';
import StoreScreen from './screens/StoreScreen';
import MatIcon from 'react-native-vector-icons/MaterialIcons';
import LoginScreen from './screens/LoginScreen';
import InsuranceStack from './Navigation/Insurance';
import SettingsStack from './Navigation/Setting';
import { useSelector, useDispatch } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import APIroute from './constants/route';
import axios from 'axios';
import { login } from './reducers/userSlice';

const Tab = createBottomTabNavigator();
const getTabBarIcon = (routeName: string) => {
  let iconName;

  switch (routeName) {
    case 'Home':
      iconName = 'home';
      break;
    case 'E-com Shop':
      iconName = 'shopping-cart';
      break;
    case 'Insurance':
      iconName = 'local-hospital';
      break; 
    case 'My Store':
      iconName = 'store';
      break;
    case 'E-com Billing':
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
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.user.user);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    const checkStatus = async () => {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (accessToken && refreshToken) {
        fetchUserData(accessToken, refreshToken);
      }
    };

    const fetchUserData = async (accessToken: string, refreshToken: string) => {
      try {
        const response = await axios.get(`${APIroute}/agent/user`, {
          headers: {
            authorization: accessToken,
            refreshtoken: refreshToken,
          },
        });
        dispatch(login(response.data.data));
        setIsLoggedIn(true);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        setIsLoggedIn(false);
      }
    };

    checkStatus();
  }, [dispatch]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarLabel: route.name === 'Login' ? () => null : undefined,
            tabBarIcon: route.name === 'Login' ? () => null : ({ color, size }) => getTabBarIcon(route.name)(color, size),
            tabBarActiveTintColor: '#0e4985',
            tabBarInactiveTintColor: 'gray',
          })}
        >
          {user ? (
            <>
              <Tab.Screen name="Home" component={HomeScreen} />
              <Tab.Screen name="Insurance" component={InsuranceStack} />
              <Tab.Screen name="E-com Shop" component={ShopScreen} />
              <Tab.Screen name="My Store" component={StoreScreen} />
              <Tab.Screen name="E-com Billing" component={BillingScreen} />
              <Tab.Screen name="Settings" component={SettingsStack} />
            </>
          ) : (
            <Tab.Screen name="Login" component={LoginScreen} />
          )}
        </Tab.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

export default App;
