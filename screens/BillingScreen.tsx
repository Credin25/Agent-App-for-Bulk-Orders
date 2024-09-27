import React from 'react';
import { View, Text } from 'react-native';
import { StyleSheet } from 'react-native';
function BillingScreen(): JSX.Element {
    return (
        <View style={styles.container}>
            <Text>Billing Screen</Text>
        </View>
    );
}

export default BillingScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

