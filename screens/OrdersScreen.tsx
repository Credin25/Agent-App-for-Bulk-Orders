import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import APIroute from '../constants/route';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScrollView } from 'react-native-gesture-handler';

function OrdersScreen() {
    const { user } = useSelector((state: any) => state.user);
    const [allOrders, setAllOrders] = useState([]);

    const fetchInitialData = async () => {
        const accessToken = await AsyncStorage.getItem('accessToken');
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        const response = await axios.get(`${APIroute}/order/user-orders?phone=${user.phone}&Agentid=${user._id}`, {
            headers: {
                authorization: accessToken,
                refreshtoken: refreshToken,
            },
        });
        setAllOrders(response.data.data);
        console.log(response.data.data);
    };

    useEffect(() => {
        fetchInitialData();
    }, []);
    const formattedDate = (dateString: string) => {
       const date = new Date(dateString).toLocaleDateString('en-IN');
       return date;
    }

    return (
        <ScrollView style={styles.container}>
            {allOrders.map((order: any) => (
                <View key={order._id} style={styles.orderCard}>
                    <Text style={styles.orderId}>Order ID: {order.orderId}</Text>
                    <Text style={styles.orderStatus}>Status: {order.orderStatus}</Text>
                    <Text style={styles.orderSource}>Ordered Through: {order.source}</Text>
                    <Text style={styles.orderDate}>Created At: {formattedDate(order.createdAt)}</Text>
                    <View style={styles.itemsContainer}>
                        {order.orderedItems.map((item: any, index: number) => (
                            <View key={index} style={styles.item}>
                                <Text style={styles.itemName}>{item.productId.name}</Text>
                                <Text style={styles.itemQuantity}>Quantity: {item.quantity}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f5f5f5',
        marginBottom: 10,
    },
    orderCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    orderId: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    orderStatus: {
        fontSize: 14,
        color: '#888',
        marginBottom: 4,
    },
    orderSource: {
        fontSize: 14,
        color: '#555',
        marginBottom: 4,
    },
    orderDate: {
        fontSize: 12,
        color: '#aaa',
        marginBottom: 12,
    },
    itemsContainer: {
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 12,
        marginTop: 12,
    },
    item: {
        marginBottom: 8,
    },
    itemName: {
        fontSize: 14,
        fontWeight: '600',
    },
    itemQuantity: {
        fontSize: 14,
        color: '#555',
    },
});

export default OrdersScreen;
