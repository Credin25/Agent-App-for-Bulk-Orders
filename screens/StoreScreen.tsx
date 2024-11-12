import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet, TouchableHighlight, Modal, Alert, ToastAndroid } from 'react-native';
import { useSelector } from 'react-redux';
import axios from 'axios';
import APIroute from '../constants/route';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
function StoreScreen(): JSX.Element {
    const { user } = useSelector((state: any) => state.user);
    const [store, setStore] = useState<any>([]);
    const [allInfo, setAllInfo] = useState<any>({});
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [modalVisible2, setModalVisible2] = useState<boolean>(false);
    const [selectedInsurance, setSelectedInsurance] = useState<any>(null);

    // Fetch data when the screen/tab is focused
    useFocusEffect(
        useCallback(() => {
            fetchAllInfo();
            fetchStoreInfo();
        }, [])
    );

    const fetchAllInfo = async () => {
        const accessToken = await AsyncStorage.getItem('accessToken');
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        try {
            const response = await axios.get(`${APIroute}/sell/get-all-information/${user._id}`, {
                headers: {
                    authorization: `${accessToken}`,
                    refreshtoken: `${refreshToken}`,
                }
            });
            if (response.data.success) {
                setAllInfo(response.data.data);
                // console.log(response.data.data);
            }
        } catch (error) {
            ToastAndroid.show('Error fetching store info', ToastAndroid.SHORT);
        }
    };

    const fetchStoreInfo = async () => {
        const accessToken = await AsyncStorage.getItem('accessToken');
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        try {
            const responce = await axios.get(`${APIroute}/agent/updateStore/${user._id}`, {
                headers: {
                    authorization: `${accessToken}`,
                    refreshtoken: `${refreshToken}`,
                }
            });
            setStore(responce.data.data.store);
        } catch (err) {
            Alert.alert('Error', ' Please try again.');
        }
    }
    const onRefresh = async () => {
        setRefreshing(true);
        await fetchAllInfo();
        setRefreshing(false);
    };

    const handleOrderClick = (order: any) => {
        setSelectedOrder(order);
        setModalVisible(true);
    };
    const handleInsuranceClick = (insurance: any) => {
        console.log(insurance);
        setSelectedInsurance(insurance);
        setModalVisible2(true);
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
                        <View style={styles.item} key={item?.product._id}>
                            <Text style={styles.itemName}>{item?.product?.name}</Text>
                            <Text >Left: {item.quantity}</Text>
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
                                <Text>Order ID {order?.orderId}</Text>
                                <Text>Amount {order?.amount}</Text>
                            </View>
                        </TouchableHighlight>
                    ))
                ) : (
                    <Text>No recent orders found.</Text>
                )}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Insurances</Text>
                {
                    allInfo?.allInsurances?.length > 0 ? (
                        allInfo?.allInsurances?.map((item: any) => (
                            <TouchableHighlight
                                key={item._id}
                                underlayColor="#f0f0f0"
                                onPress={() => handleInsuranceClick(item)}
                            >
                                <View style={styles.item}>
                                    <Text>Customer Name:{item?.customerDetails?.customerName}</Text>
                                    <Text>Customer Mobile: {item?.customerDetails?.customerContactNumber}</Text>
                                    <Text>Insurance For: {item?.insuranceFor}</Text>
                                </View>
                            </TouchableHighlight>
                        ))
                    ) : (
                        <Text>No insurances found.</Text>
                    )
                }

            </View>


            {/* Modal to display selected order details */}
            {selectedOrder && (
                <Modal
                    visible={modalVisible}
                    animationType="slide"
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalView}>
                            <Text style={styles.modalTitle}>Order Details</Text>
                            <Text>Order ID: {selectedOrder?.orderId}</Text>
                            <Text>Amount: {selectedOrder?.amount}</Text>
                            <Text>Customer Name: {selectedOrder?.customerName}</Text>
                            <Text>Customer Contact: {selectedOrder?.customerContactNumber}</Text>
                            <Text>Payment Mode: {selectedOrder?.paymentMode}</Text>
                            <Text style={{ marginTop: 10, fontSize: 15, fontWeight: 'bold', color: '#0e4985' }}>Products:</Text>
                            {selectedOrder?.sellItems.map((item: any, index: number) => (
                                <View key={index} style={styles.productRow}>
                                    <Text style={styles.productName}>
                                        {index + 1}. {item?.productId?.name}
                                    </Text>
                                    <Text style={styles.productQuantity}>
                                        Quantity: {item?.quantity}
                                    </Text>
                                </View>
                            ))}
                            {/* Close button with new styles */}
                            <TouchableHighlight
                                style={styles.closeButton}
                                onPress={() => setModalVisible(false)}
                                underlayColor="#0e4985"
                            >
                                <Text style={styles.closeButtonText}>Close</Text>
                            </TouchableHighlight>
                        </View>
                    </View>
                </Modal>
            )}
            {
                selectedInsurance && (
                    <Modal
                        visible={modalVisible2}
                        animationType="slide"
                        onRequestClose={() => setModalVisible2(false)} >
                        {
                            selectedInsurance && (
                                <View style={styles.modalContainer}>
                                    <View style={styles.modalView}>
                                        <Text style={styles.modalTitle}>Insurance Details</Text>
                                        <Text style={{ fontWeight: 'bold' }}>Plan: <Text style={{ fontWeight: '400' }} >{selectedInsurance?.insurancePlan}</Text></Text>
                                        <Text style={{ fontWeight: 'bold' }}>Insurance Number:<Text style={{ fontWeight: '400' }} > {selectedInsurance?.insuranceNumber}</Text></Text>
                                        <Text style={{ fontWeight: 'bold' }}>Name: <Text style={{ fontWeight: '400' }} >{selectedInsurance?.name}</Text></Text>
                                        <Text style={{ fontWeight: 'bold' }}>Gender:<Text style={{fontWeight: '400' }} > {selectedInsurance?.gender}</Text></Text>
                                        <Text style={{ fontWeight: 'bold' }}>Mobile:<Text style={{fontWeight: '400' }} > {selectedInsurance?.mobile}</Text></Text>
                                        <Text style={{ fontWeight: 'bold' }}>Occupation:<Text style={{ fontWeight: '400' }} > {selectedInsurance?.occupation}</Text></Text>
                                        <View>
                                            <Text style={styles.modalTitle}>Nominee Details</Text>
                                            <Text style={{ fontWeight: 'bold' }}>Name:<Text style={{ fontWeight: '400' }} > {selectedInsurance?.nomineeDetails?.name}</Text></Text>
                                            <Text style={{ fontWeight: 'bold' }}>Gender:<Text style={{ fontWeight: '400' }} > {selectedInsurance?.nomineeDetails?.gender}</Text></Text>
                                            <Text style={{ fontWeight: 'bold' }}>Age:<Text style={{ fontWeight: '400' }} >{selectedInsurance?.nomineeDetails?.age}</Text></Text>
                                        </View>
                                        <TouchableHighlight
                                            style={styles.closeButton}
                                            onPress={() => setModalVisible2(false)}
                                            underlayColor="#0e4985"
                                        >

                                            <Text style={styles.closeButtonText}>Close</Text>
                                        </TouchableHighlight>
                                    </View>
                                </View>
                            )
                        }

                    </Modal>
                )
            }
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
        color: '#0e4985'
    },
    item: {
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        padding: 10,
        marginBottom: 8,
    },
    itemName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 3,
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
        elevation: 5,
    },
    modalView: {
        backgroundColor: "white",
        padding: 20,
        borderRadius: 15,
        shadowOpacity: 0.25,
        elevation: 5,
        shadowOffset: {
            width: 0,
            height: 2,
        },
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
        color: '#0e4985'
    },
    productRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
        paddingVertical: 5,
        width: '100%',
    },
    productName: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#555',
    },
    productQuantity: {
        fontSize: 16,
        color: '#555',
    },
    closeButton: {
        marginTop: 20,
        padding: 10,
        backgroundColor: "#0e4985",
        borderRadius: 5,
        alignSelf: 'center',
    },
    closeButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
    },
});
