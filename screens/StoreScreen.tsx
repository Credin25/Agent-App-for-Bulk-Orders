import React from 'react';
import { View, Text} from 'react-native';
import { StyleSheet } from 'react-native';
function StoreScreen(): JSX.Element {
    return (
        <View style={styles.container}>
            <Text>Store Screen</Text>
        </View>
    );
}

export default StoreScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

