import React from 'react';
import { View, Text } from 'react-native';
import { StyleSheet } from 'react-native';
import MatIcon from 'react-native-vector-icons/MaterialIcons';

function SettingsScreen(): JSX.Element {
    return (
        <View style={styles.container}>
            <Text>Settings Screen</Text>
            <MatIcon name="home" size={30} color="red" />
            <MatIcon name="shopping-cart" size={30} color="red" />
            <MatIcon name="store" size={30} color="red" />
            <MatIcon name="calculate" size={30} color="red" />
            <MatIcon name="settings" size={30} color="red" />
        </View>
    );
}

export default SettingsScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
