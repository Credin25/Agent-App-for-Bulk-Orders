import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import APIroute from '../contants/route';
import { updateUser } from '../reducers/userSlice';
import Product from '../interfaces/ShopScreen';

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
    try {
      const updatedStore = await Promise.all(
        user.store.map(async (product: any) => {
          const response = await axios.get(`${APIroute}/product/${product.product}`);
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
      console.error('Error fetching product details:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text>Welcome, {user?.firstName} {user?.lastName}</Text>
      <Text>Store of User:</Text>
      {products.map((product, index) => (
        <View key={index}>
          <Text>{product.name}: {product.quantity}</Text>
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
