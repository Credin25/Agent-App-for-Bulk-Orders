import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MatIcon from 'react-native-vector-icons/MaterialIcons';

const settingsOptions = [
    { id: '1', name: 'Account', icon: 'account-circle' },
    { id: '2', name: 'Notifications', icon: 'notifications' },
    { id: '3', name: 'Language', icon: 'language' },
    { id: '4', name: 'Privacy', icon: 'lock' },
    { id: '5', name: 'Help & Support', icon: 'help' },
    { id: '6', name: 'About App', icon: 'info' },
    { id: '7', name: 'Logout', icon: 'logout' },


];

function SettingsScreen(): JSX.Element {
    return (
        <View style={styles.container}>
            {settingsOptions.map(option => (
                <TouchableOpacity key={option.id} style={styles.option}>
                    <MatIcon name={option.icon} size={30} color="#87ceeb" />
                    <Text style={styles.optionText}>{option.name}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );
}

export default SettingsScreen;

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
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    optionText: {
        fontSize: 18,
        marginLeft: 15,
    },
});
