import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet, TouchableHighlight, Modal} from 'react-native';
import { useSelector } from 'react-redux';
import axios from 'axios';
import APIroute from '../contants/route';
import { useFocusEffect } from '@react-navigation/native';

function StoreScreen(): JSX.Element {
    const { user } = useSelector((state: any) => state.user);
    const store = user?.store || [];
    const [allInfo, setAllInfo] = useState<any>({});
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [selectedOrder, setSelectedOrder] = useState<any>(null); // To track selected order for modal
    const [modalVisible, setModalVisible] = useState<boolean>(false); // To control modal visibility

    // Fetch data when the screen/tab is focused
    useFocusEffect(
        useCallback(() => {
            fetchAllInfo();
        }, [])
    );

    const fetchAllInfo = async () => {
        try {
            const response = await axios.get(`${APIroute}/sell/get-all-information/${user._id}`);
            if (response.data.success) {
                setAllInfo(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching store info:', error);
        }
    };

    // Function to handle pull-to-refresh
    const onRefresh = async () => {
        setRefreshing(true);
        await fetchAllInfo();
        setRefreshing(false);
    };

    // Function to open modal with selected order details
    const handleOrderClick = (order: any) => {
        setSelectedOrder(order); // Set selected order
        setModalVisible(true);   // Show modal
    };

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Store</Text>
                {store.length > 0 ? (
                    store.map((item: any) => (
                        <View style={styles.item} key={item.product}>
                            <Text style={styles.itemName}>{item.name}</Text>
                            <Text style={styles.itemQuantity}>Left: {item.quantity}</Text>
                        </View>
                    ))
                ) : (
                    <Text>No items in store.</Text>
                )}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Information</Text>
                <View style={styles.infoItem}>
                    <Text>Today's Total Order:</Text>
                    <Text style={styles.infoValue}>{allInfo?.todaysOrders || 0}</Text>
                </View>
                <View style={styles.infoItem}>
                    <Text>This Month's Total Order:</Text>
                    <Text style={styles.infoValue}>{allInfo?.monthOrders || 0}</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recent Orders</Text>
                {allInfo?.recent5Orders?.length > 0 ? (
                    allInfo.recent5Orders.map((order: any) => (
                        <TouchableHighlight
                            key={order._id}
                            onPress={() => handleOrderClick(order)} // Trigger modal on order click
                            underlayColor="#f0f0f0"
                        >
                            <View style={styles.item}>
                                <Text>Order {order?.orderId}</Text>
                                <Text>Amount {order?.amount}</Text>
                            </View>
                        </TouchableHighlight>
                    ))
                ) : (
                    <Text>No recent orders found.</Text>
                )}
            </View>

            {/* Modal to display selected order details */}
            {selectedOrder && (
              <Modal
              visible={modalVisible}
              animationType="slide"
              onRequestClose={() => setModalVisible(false)}
          >
              <View style={styles.modalContainer}>
                  <Text style={styles.modalTitle}>Order Details</Text>
                  <Text>Order ID: {selectedOrder?.orderId}</Text>
                  <Text>Amount: {selectedOrder?.amount}</Text>
                  <Text>Customer Name: {selectedOrder?.customerName}</Text>
                  <Text>Customer Contact: {selectedOrder?.customerContactNumber}</Text>
                  <Text>Payment Mode: {selectedOrder?.paymentMode}</Text>
                  <Text style={{marginTop:10}}>Products:</Text>
                  {selectedOrder?.sellItems.map((item: any, index: number) => (
                      <View key={index} style={styles.productRow}>
                          <Text style={styles.productName}>
                              {index + 1}. {item.productId.name}
                          </Text>
                          <Text style={styles.productQuantity}>
                              Quantity: {item.quantity}
                          </Text>
                      </View>
                  ))}
                  <Text style={{marginTop: 10}}>
                      Created At: {new Date(selectedOrder?.createdAt).toLocaleString()}
                  </Text>
                  {/* Close button with new styles */}
                  <TouchableHighlight
                      style={styles.closeButton}
                      onPress={() => setModalVisible(false)}
                      underlayColor="#0056b3"
                  >
                      <Text style={styles.closeButtonText}>Close</Text>
                  </TouchableHighlight>
              </View>
          </Modal>
            )}
        </ScrollView>
    );
}

export default StoreScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 16,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    item: {
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        padding: 10,
        marginBottom: 8,
    },
    infoItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        marginBottom: 8,
    },
    infoValue: {
        fontWeight: 'bold',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#ffffff',
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5, // For Android shadow
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    productRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
        paddingVertical: 5,
        width: '100%',
    },
    productName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    productQuantity: {
        fontSize: 16,
        color: '#555',
    },
    closeButton: {
        marginTop: 20,
        padding: 10,
        backgroundColor: '#007bff', // Button color
        borderRadius: 5,
        alignSelf: 'center',
    },
    closeButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
    },
});
