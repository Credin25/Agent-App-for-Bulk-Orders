import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert , Pressable} from 'react-native';
import MatIcon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../reducers/userSlice';
import axios from 'axios';
import { Modal, Button } from 'react-native';
const settingsOptions = [
    { id: '1', name: 'Account', icon: 'account-circle' },
    // { id: '2', name: 'Notifications', icon: 'notifications' },
    // { id: '3', name: 'Language', icon: 'language' },
    // { id: '4', name: 'Privacy', icon: 'lock' },
    { id: '5', name: 'Help & Support', icon: 'help' },
    // { id: '6', name: 'About App', icon: 'info' },
    { id: '7', name: 'Logout', icon: 'logout' },
];

function SettingsScreen(): JSX.Element {
    const dispatch = useDispatch();
    const { user } = useSelector((state: any) => state.user);
    const [isModalVisible, setModalVisible] = React.useState(false);
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
        if (optionId === '7') {
            handleLogout();
        } else if (optionId === '1') {
            setModalVisible(true);
        } else if (optionId === '5') {
            handleHelpAndSupportPress();
        }
        else {
            Alert.alert(`Option ${optionId} pressed`);
        }
    };

    const handleHelpAndSupportPress = () => {
        Alert.alert(
            'Help & Support',
            'For any help and support, please contact us:\n\n' +
            'Phone: 987-901-5554\n' +
            'Alternate Phone: 798-326-8080\n\n' +
            'Email: help@credin.in',
            [{ text: 'OK' }]
        );
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
           <Modal
                transparent={true}
                visible={isModalVisible}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Your Account Details</Text>
                        {user && (
                            <>
                                <Text style={styles.modalText}>Aadhar: {user.aadharNumber}</Text>
                                <Text style={styles.modalText}>Pan: {user.panNumber}</Text>
                                <Text style={styles.modalText}>Mobile: {user.phone}</Text>
                                <Text style={styles.modalText}>Voter ID: {user.voterId}</Text>
                                <Text style={styles.modalText}>Email: {user.email}</Text>
                                <Text style={styles.modalText}>Gender: {user.gender}</Text>
                            </>
                        )}
                        <Pressable style={styles.closeButton} onPress={() => setModalVisible(false)}>
                            <Text style={styles.closeButtonText}>Close</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
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
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        width: '85%',
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 25,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#044ca4',
    },
    modalText: {
        fontSize: 16,
        color: '#333',
        marginBottom: 8,
    },
    closeButton: {
        marginTop: 20,
        backgroundColor: '#044ca4',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
