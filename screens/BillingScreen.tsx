import React, { useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet, TextInput, Modal, Alert, ToastAndroid, Pressable } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useSelector } from 'react-redux';
import axios from 'axios';
import APIroute from '../constants/route';
import { useDispatch } from 'react-redux';
import { updateUser } from '../reducers/userSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
function BillingScreen(): JSX.Element {
    const { user } = useSelector((state: any) => state.user);
    const dispatch = useDispatch();
    const store = user.store;
    console.log(store);
    const [cart, setCart] = useState<{ id: string; name: string; price: number; quantity: number }[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [customerInfo, setCustomerInfo] = useState<{ name: string; phone: string }>({ name: '', phone: '' });
    const [paymentMethod, setPaymentMethod] = useState<string>('CASH');
    const [modalVisible, setModalVisible] = useState<boolean>(false);

    const addToCart = (product: { id: string; name: string; price: { safalAppPrice: number }; quantity: number }) => {
        const existingProduct = cart.find(item => item.id === product.id);
        const price = product.price.safalAppPrice;

        if (existingProduct) {
            setCart(prevCart =>
                prevCart.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                )
            );
        } else {
            setCart(prevCart => [...prevCart, { id: product.id, name: product.name, price, quantity: 1 }]);
        }
        setTotal(prevTotal => prevTotal + price);
    };

    const removeFromCart = (id: string) => {
        const itemToRemove = cart.find(item => item.id === id);
        if (itemToRemove) {
            const newCart = cart.filter(item => item.id !== id);
            setCart(newCart);
            setTotal(prevTotal => prevTotal - (itemToRemove.price * itemToRemove.quantity));
        }
    };

    const createNewBill = async () => {
        const accessToken = await AsyncStorage.getItem('accessToken');
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        const sellItems = cart.map(item => ({ productId: item.id, quantity: item.quantity }));
        if (!customerInfo.name || !customerInfo.phone) {
            ToastAndroid.show('Please enter customer name and phone number', ToastAndroid.SHORT);
            return;
        }
        if (customerInfo.phone.length !== 10) {
            ToastAndroid.show('Please enter valid phone number', ToastAndroid.SHORT);
            return;
        }
        if (total === 0) {
            ToastAndroid.show('Please add items to cart', ToastAndroid.SHORT);
            return;
        }
        const body = {
            agentId: user._id,
            amount: total,
            sellItems: sellItems,
            customerContactNumber: customerInfo.phone,
            customerName: customerInfo.name,
            paymentMode: paymentMethod,
        };

        const responce = await axios.post(`${APIroute}/sell/createBill`, body, {
            headers: {
                authorization: `${accessToken}`,
                refreshtoken: `${refreshToken}`,
            }
        });
        if (responce.data.success) {
            Alert.alert('Success', responce.data.message);
            updateStore();
        }
        setCart([]);
        setTotal(0);
        setModalVisible(false);
        setCustomerInfo({ name: '', phone: '' });
    };
    const updateStore = async () => {
        const accessToken = await AsyncStorage.getItem('accessToken');
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        try {
            const updatedAgent = await axios.get(`${APIroute}/agent/updateStore/${user._id}`, {
                headers: {
                    authorization: `${accessToken}`,
                    refreshtoken: `${refreshToken}`,
                }
            });
            // const updatedStore = updatedAgent.data.data.store;
            // updatedStore.forEach((item: any) => {
            //     user.store.forEach((product: any) => {
            //         if (product.product === item.product) {
            //             product.quantity = item.quantity;
            //         }
            //     });
            // });
            // // Dispatch action to update Redux store
            // dispatch(updateUser({ ...user, store }));

        } catch (error) {
            Alert.alert('Error', 'Could not update the store. Please try again.');
        }
    };
    const handleClearCart = async () =>{
        setTotal(0);
        setCart([]);
    }
    const renderProductItem = ({ item }: { item: { product: string; name: string; price: { safalAppPrice: number }; quantity: number } }) => (
        <View style={styles.productItem}>
            <Text>{item?.name}</Text>
            <Text>₹{item?.price?.safalAppPrice}</Text>
            <Button title="Add" onPress={() => addToCart({ id: item.product, name: item.name, price: item.price, quantity: item.quantity })} color="#0e4985" />
        </View>
    );

    const renderCartItem = ({ item }: { item: { id: string; name: string; price: number; quantity: number } }) => (
        <View style={styles.cartItem}>
            <Text>{item?.name}</Text>
            <Text>Quantity: {item.quantity}</Text>
            <Text>₹{item.price * item.quantity}</Text>
            <Button title="Remove" onPress={() => removeFromCart(item.id)} color="#0e4985" />
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>New Billing</Text>
            <FlatList
                data={store}
                renderItem={renderProductItem}
                keyExtractor={item => item.product}
                style={styles.productList}
            />
            <View style={styles.cartContainer}>
                <Text style={styles.cartTitle}>Cart</Text>
                <FlatList
                    data={cart}
                    renderItem={renderCartItem}
                    keyExtractor={item => item.id}
                />
            </View>
            <View style={styles.totalContainer}>
                <Text style={styles.totalText}>Total Amount: ₹{total}</Text>
            </View>
            <View style={styles.buttonContainer}>
                <Button title="Create Bill" onPress={() => setModalVisible(true)} color="#0e4985"/>
                <Button title="Clear Cart" onPress={handleClearCart} color="#0e4985" />
            </View>

            {/* Modal for Customer Info and Payment Method */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalBackground}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalTitle}>Customer Information</Text>
                        <TextInput
                            placeholder="Customer Name"
                            style={styles.input}
                            value={customerInfo.name}
                            onChangeText={(text) => setCustomerInfo({ ...customerInfo, name: text })}
                        />
                        <TextInput
                            placeholder="Phone Number"
                            style={styles.input}
                            keyboardType="phone-pad"
                            value={customerInfo.phone}
                            onChangeText={(text) => setCustomerInfo({ ...customerInfo, phone: text })}
                        />

                        <Text style={styles.label}>Payment Method</Text>
                        <Picker
                            selectedValue={paymentMethod}
                            style={styles.picker}
                            onValueChange={(itemValue) => setPaymentMethod(itemValue)}
                        >
                            <Picker.Item label="CASH" value="CASH" />
                            <Picker.Item label="ONLINE" value="ONLINE" />
                        </Picker>

                        <View style={styles.modalButtonContainer}>
                            <Button title="Submit" onPress={createNewBill} color="#0e4985"/>
                            <Button title="Cancel" onPress={() => setModalVisible(false)} color="#BB0000" />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

export default BillingScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    productList: {
        marginBottom: 20,
    },
    productItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    cartContainer: {
        marginBottom: 20,
    },
    cartTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    cartItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    totalContainer: {
        marginTop: 20,
        padding: 10,
        borderTopWidth: 1,
        borderTopColor: '#ccc',
        alignItems: 'center',
    },
    totalText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    input: {
        width: '100%',
        padding: 10,
        marginBottom: 10,
        backgroundColor: '#f1f1f1',
        borderRadius: 5,
    },
    label: {
        fontSize: 16,
        marginBottom: 10,
    },
    picker: {
        height: 50,
        width: '100%',
        marginBottom: 20,
    },
    modalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    button: {
        backgroundColor: '#0e4985',
        paddingVertical: 8,
        paddingHorizontal: 24,
        borderRadius: 4,
        alignItems: 'center',
        flexDirection: 'row',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 14 },
        shadowOpacity: 0.6,
        shadowRadius: 6,
        elevation: 5,
        maxWidth: '40%',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
});
