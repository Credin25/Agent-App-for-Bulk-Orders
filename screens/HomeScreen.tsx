import React, { useEffect, useState } from 'react';
import { View, Text, ToastAndroid, Pressable, ImageBackground, StyleSheet, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import APIroute from '../constants/route';
import { updateUser } from '../reducers/userSlice';
import Product from '../interfaces/ShopScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const Logo = require('../assets/background.jpg');

function HomeScreen(): JSX.Element {
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.user.user);
  const [, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    if (user && user.store) {
      fetchProductsAndUpdateUser();
    }
  }, []);

  const fetchProductsAndUpdateUser = async () => {
    const accessToken = await AsyncStorage.getItem('accessToken');
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    try {
      const updatedStore = await Promise.all(
        user.store.map(async (product: any) => {
          const response = await axios.get(`${APIroute}/product/${product.product}`, {
            headers: {
              authorization: accessToken,
              refreshtoken: refreshToken
            }
          });
          return {
            ...product,
            name: response.data.data.name,
            price: response.data.data.price,
          };
        })
      );

      setProducts(updatedStore);
      dispatch(updateUser({ ...user, store: updatedStore }));
    } catch (error) {
      console.error('Error fetching product details:', error);
      ToastAndroid.show('Error fetching product details', ToastAndroid.SHORT);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground source={Logo} style={styles.background}>
      <View style={styles.overlay} />
      {loading ? (
        <ActivityIndicator size="large" color="#0e4985" style={styles.loader} />
      ) : (
        <View style={styles.boxContainer}>
          <Pressable onPress={() => navigation.navigate('Insurance')} style={styles.box}>
            <Icon name="shield-check-outline" size={40} color="#0e4985" />
            <Text style={styles.boxText}>Insurance</Text>
          </Pressable>
          <Pressable onPress={() => navigation.navigate('E-com Shop')} style={styles.box}>
            <Icon name="cart-outline" size={40} color="#0e4985" />
            <Text style={styles.boxText}>E-com Shopping</Text>
          </Pressable>
          <Pressable onPress={() => navigation.navigate('E-com Billing')} style={styles.box}>
            <Icon name="calculator-variant-outline" size={40} color="#0e4985" />
            <Text style={styles.boxText}>E-com Billing</Text>
          </Pressable>
          <Pressable onPress={() => navigation.navigate('My Store')} style={styles.box}>
            <Icon name="store-outline" size={40} color="#0e4985" />
            <Text style={styles.boxText}>My Store</Text>
          </Pressable>
        </View>
      )}
    </ImageBackground>
  );
}

export default HomeScreen;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.0009)', 
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  boxContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  box: {
    width: '40%',
    aspectRatio: 1,
    margin: 10,
    borderWidth: 1,
    backgroundColor: '#fff',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    padding: 10,
    borderColor: '#0e4985',
  },
  boxText: {
    color: '#0e4985',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
  },
});
