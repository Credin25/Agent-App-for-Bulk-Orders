import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import MatIcon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { logout } from '../reducers/userSlice';
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
    const dispatch = useDispatch();

    const handleLogout = async () => {
        const accessToken = await AsyncStorage.getItem('accessToken');
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        // Simulate logout process, e.g., clearing tokens or app state
        Alert.alert(
            'Logout',
            'Are you sure you want to log out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'OK', onPress: () => {
                        AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
                        dispatch(logout());

                    }
                }, // Replace the stack with LoginScreen
            ],
            { cancelable: true }
        );
    };

    const handleOptionPress = (optionId: string) => {
        if (optionId === '7') { // Logout option
            handleLogout();
        } else {
            Alert.alert(`Option ${optionId} pressed`);
        }
    };

    return (
        <View style={styles.container}>
            {settingsOptions.map(option => (
                <TouchableOpacity
                    key={option.id}
                    style={styles.option}
                    onPress={() => handleOptionPress(option.id)}
                >
                    <MatIcon name={option.icon} size={30} color="#044ca4" />
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
