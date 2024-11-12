import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, Image, TouchableOpacity, ToastAndroid } from 'react-native';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { login } from '../reducers/userSlice';
import APIroute from '../constants/route.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
const Logo = require('../assets/LogoSafal.png');
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
        try {
            const mobileNumber = parseInt(mobile);
            const res = await axios.post(`${APIroute}/auth/login`, { platform: 'AGENT APP', phone: mobileNumber, password: password });
            if (res.data.success) {
                await AsyncStorage.setItem('accessToken', `Bearer ${res.data.data.accessToken}`);
                await AsyncStorage.setItem('refreshToken', `${res.data.data.refreshToken}`);
                dispatch(login(res.data.data.agent));
                Alert.alert('Login Successful');
            } else {
                ToastAndroid.show(res.data.message || "An error occurred. Please try again.", ToastAndroid.BOTTOM);
            }
        }
        catch (err:any) {
            ToastAndroid.show(err.response?.data?.message || "An error occurred. Please try again.", ToastAndroid.BOTTOM);
        }

    };

    return (
        <View style={styles.container}>
            <Image source={Logo} style={styles.logo} />
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
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
    },
    logo: {
        width: '100%',
        height: undefined,
        aspectRatio: 3,
        resizeMode: 'contain',
        marginBottom: 40,
    },
    input: {
        width: '100%',
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 15,
        paddingHorizontal: 10,
    },
    button: {
        backgroundColor: '#00425A',
        paddingVertical: 10,
        paddingHorizontal: 50,
        borderRadius: 5,
        width: '100%',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default LoginScreen;
