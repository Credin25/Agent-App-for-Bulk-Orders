import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Image, FlatList, Pressable, StyleSheet, Dimensions, TouchableOpacity, Button, TextInput, Modal, Alert , ToastAndroid} from 'react-native';
import axios from 'axios';
import { useSelector } from 'react-redux';
import Product from '../interfaces/ShopScreen';
import APIroute from '../constants/route';
import AsyncStorage from '@react-native-async-storage/async-storage';
function ShopScreen(): JSX.Element {
  const [products, setProducts] = useState<Product[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [address, setAddress] = useState({
    pincode: '',
    state: '',
    city: '',
    district: '',
    addressLine1: '',
  });
  const [deliveryContactNumber, setDeliveryContactNumber] = useState('');
  const [orderTotal, setOrderTotal] = useState(0);

  const user = useSelector((state: any) => state.user.user);

  const fetchProducts = useCallback(async () => {
    const accessToken = await AsyncStorage.getItem('accessToken');
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    try {
      const response = await axios.get(`${APIroute}/product`, {
        headers: {
          authorization : accessToken,
          refreshtoken : refreshToken
        }
      });
      setProducts(response.data.data.products);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch products. Please try again.');
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    if (user?.address) {
      setAddress({
        pincode: user.address.pinCode?.toString() || '',
        state: user.address.state || '',
        city: user.address.city || '',
        district: user.address.district || '',
        addressLine1: user.address.addressLine1 || '',
      });
    }
    if (user?.phone) {
      setDeliveryContactNumber(user.phone.toString());
    }
  }, [fetchProducts, user]);

  useEffect(() => {
    const total = Object.entries(quantities).reduce((sum, [id, quantity]) => {
      const product = products.find(p => p._id === id);
      return product ? sum + (product.price.agentAppPrice * quantity) : sum;
    }, 0);
    setOrderTotal(total);
  }, [quantities, products]);

  const updateQuantity = useCallback((id: string, increment: number) => {
    setQuantities(prev => ({
      ...prev,
      [id]: Math.max((prev[id] || 0) + increment, 0),
    }));
  }, []);

  const placeOrder = useCallback(async () => {
    const accessToken = await AsyncStorage.getItem('accessToken');
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    if(orderTotal === 0){
     ToastAndroid.show('Cart is empty, please add some items', ToastAndroid.SHORT);
     return;
    }
    try {
      const orderData = {
        amount: orderTotal,
        source: 'AGENT APP',
        deliveryAddress: address,
        deliveryContactNumber: parseInt(deliveryContactNumber),
        orderedBy: user.phone.toString(),
        orderedItems: Object.entries(quantities)
          .filter(([, quantity]) => quantity > 0)
          .map(([id, quantity]) => ({ productId: id, quantity })),
      };
     const responce = await axios.post(`${APIroute}/order`, orderData, {
       headers: {
         authorization : accessToken,
         refreshtoken : refreshToken
       }
     });
     if(responce.data.success){
      Alert.alert('Success', responce.data.message);
     }
      setModalVisible(false);
      setQuantities({});
    } catch (error) {
      Alert.alert('Error', 'Failed to place order. Please try again.');
    }
  }, [orderTotal, address, deliveryContactNumber, user.phone, quantities]);

  const renderItem = useCallback(({ item }: { item: Product }) => (
    <Pressable style={styles.itemContainer}>
      <Image source={{ uri: item.image[0] || 'https://via.placeholder.com/140' }} style={styles.image} />
      <Text style={styles.productName}>{item.name}</Text>
      <Text style={styles.productPrice}>Price: ₹{item.price.agentAppPrice}</Text>
      <View style={styles.quantityContainer}>
        <TouchableOpacity onPress={() => updateQuantity(item._id, -1)} style={styles.button}>
          <Text>-</Text>
        </TouchableOpacity>
        <Text>{quantities[item._id] || 0}</Text>
        <TouchableOpacity onPress={() => updateQuantity(item._id, 1)} style={styles.button}>
          <Text>+</Text>
        </TouchableOpacity>
      </View>
    </Pressable>
  ), [quantities, updateQuantity]);

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
      />
      <Button
        title={`Checkout ₹${orderTotal}`}
        onPress={() => setModalVisible(true)}
      />
      <Modal
        transparent={true}
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Enter Delivery Address</Text>
            {Object.entries(address).map(([key, value]) => (
              <TextInput
                key={key}
                placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                value={value}
                onChangeText={(text) => setAddress(prev => ({ ...prev, [key]: text }))}
                style={styles.input}
                keyboardType={key === 'pincode' ? 'numeric' : 'default'}
              />
            ))}
            <TextInput
              placeholder="Delivery Contact Number"
              value={deliveryContactNumber}
              onChangeText={setDeliveryContactNumber}
              style={styles.input}
              keyboardType="numeric"
            />
            <View style={styles.buttonContainer}>
              <Button title="Submit" onPress={placeOrder} />
              <Button title="Cancel" onPress={() => setModalVisible(false)} color="#FF0000" />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export default ShopScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    padding: 10,
  },
  listContainer: {
    justifyContent: 'space-between',
  },
  itemContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    margin: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    flex: 1,
    maxWidth: Dimensions.get('window').width / 2 - 15,
  },
  image: {
    width: 150,
    height: 150,
    marginBottom: 10,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  productPrice: {
    fontSize: 14,
    color: '#e91e63',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '80%',
    marginTop: 10,
  },
  button: {
    backgroundColor: '#ccc',
    padding: 5,
    borderRadius: 5,
    minWidth: 30,
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  formContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    elevation: 5,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
