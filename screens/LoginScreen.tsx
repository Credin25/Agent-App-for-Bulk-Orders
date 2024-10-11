import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { login } from '../reducers/userSlice';
import APIroute from '../contants/route.js';
const LoginScreen = () => {
    const [mobile, setMobile] = useState('');
    const [password, setPassword] = useState('');
    const dispatch = useDispatch();
    const handleLogin = async () => {
        if (!mobile || !password) {
            Alert.alert('Error', 'Please enter mobile number and password.');
            return;
        }

        if (mobile.length !== 10) {
            Alert.alert('Error', 'Mobile number should be 10 digits.');
            return;
        }
        const mobileNumber = parseInt(mobile);
        const res = await axios.get(`${APIroute}/agent?mobile=${mobileNumber}&password=${password}`);
        if (res.data.success) {
            dispatch(login(res.data.data));
            Alert.alert('Login Successful');
        } else {
            Alert.alert('Error', 'Invalid mobile number or password.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Login</Text>
            <TextInput
                style={styles.input}
                placeholder="Mobile Number"
                keyboardType="phone-pad"
                value={mobile}
                onChangeText={setMobile}
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />
            <Button title="Login" onPress={handleLogin} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 15,
        paddingHorizontal: 10,
    },
});

export default LoginScreen;
