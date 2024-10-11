import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Modal } from 'react-native';
import { Picker } from '@react-native-picker/picker';

interface PaymentModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (name: string, phone: string, paymentMethod: string) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ visible, onClose, onSubmit }) => {
    const [name, setName] = useState<string>('');
    const [phone, setPhone] = useState<string>('');
    const [paymentMethod, setPaymentMethod] = useState<string>('Cash');

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalBackground}>
                <View style={styles.modalView}>
                    <Text style={styles.modalTitle}>Customer Information</Text>
                    <TextInput
                        placeholder="Customer Name"
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                    />
                    <TextInput
                        placeholder="Phone Number"
                        style={styles.input}
                        keyboardType="phone-pad"
                        value={phone}
                        onChangeText={setPhone}
                    />

                    <Text style={styles.label}>Payment Method</Text>
                    <Picker
                        selectedValue={paymentMethod}
                        style={styles.picker}
                        onValueChange={(itemValue) => setPaymentMethod(itemValue)}
                    >
                        <Picker.Item label="Cash" value="Cash" />
                        <Picker.Item label="UPI" value="UPI" />
                    </Picker>

                    <View style={styles.buttonContainer}>
                        <Button title="Submit" onPress={() => onSubmit(name, phone, paymentMethod)} />
                        <Button title="Cancel" onPress={onClose} />
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default PaymentModal;

const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    input: {
        width: '100%',
        padding: 10,
        marginBottom: 10,
        backgroundColor: '#f1f1f1',
        borderRadius: 5,
    },
    label: {
        fontSize: 16,
        marginBottom: 10,
    },
    picker: {
        height: 50,
        width: '100%',
        marginBottom: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
});
