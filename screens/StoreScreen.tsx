import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import APIroute from '../contants/route';
function StoreScreen(): JSX.Element {

    const { user } = useSelector((state: any) => state.user);
    const store = user.store;
    return (
        <ScrollView style={styles.container}>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Store</Text>
                {store.map((item: any) => (
                    <View style={styles.item} key={item.product}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        <Text style={styles.itemQuantity}>Left: {item.quantity}</Text>
                    </View>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Information</Text>
                <View style={styles.infoItem}>
                    <Text>Today's Total Order:</Text>
                    <Text style={styles.infoValue}>6</Text>
                </View>
                <View style={styles.infoItem}>
                    <Text>This Week's Total Order:</Text>
                    <Text style={styles.infoValue}>100</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Products Sell Information</Text>
                <View style={styles.item}>
                    <Text style={styles.itemName}>Product 1</Text>
                    <Text style={styles.itemQuantity}>Quantity: 10</Text>
                </View>
                <View style={styles.item}>
                    <Text style={styles.itemName}>Product 2</Text>
                    <Text style={styles.itemQuantity}>Quantity: 20</Text>
                </View>
                <View style={styles.item}>
                    <Text style={styles.itemName}>Product 3</Text>
                    <Text style={styles.itemQuantity}>Quantity: 30</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Orders</Text>
                <View style={styles.item}>
                    <Text>Order 1</Text>
                </View>
                <View style={styles.item}>
                    <Text>Order 2</Text>
                </View>
                <View style={styles.item}>
                    <Text>Order 3</Text>
                </View>
                <View style={styles.item}>
                    <Text>Order 4</Text>
                </View>
            </View>
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
    itemName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    itemQuantity: {
        fontSize: 14,
        color: '#555',
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
});
