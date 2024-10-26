import React, { useEffect, useState } from 'react';
import { View, Text, ToastAndroid } from 'react-native';
import { StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import APIroute from '../constants/route';
import { updateUser } from '../reducers/userSlice';
import Product from '../interfaces/ShopScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
function HomeScreen(): JSX.Element {
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.user.user);
  const [products, setProducts] = useState<Product[]>([]);

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
      // Update local state (optional)
      setProducts(updatedStore);

      // Dispatch action to update Redux store
      dispatch(updateUser({ ...user, store: updatedStore }));

    } catch (error) {
      ToastAndroid.show('Error fetching product details', ToastAndroid.SHORT);
    }
  };

  return (
    <View style={styles.container}>
      <Text>Welcome, {user?.firstName} {user?.lastName}</Text>
      <Text>Store of User:</Text>
      {products.map((product, index) => (
        <View key={index}>
          <Text>{product.name}: {product?.quantity}</Text>
        </View>
      ))}
    </View>
  );
}

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
