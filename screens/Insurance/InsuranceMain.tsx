import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Button, Modal, PermissionsAndroid } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import MatIcon from 'react-native-vector-icons/MaterialIcons';
import ImagePicker from 'react-native-image-crop-picker';
import axios from 'axios';
import APIroute from '../../contants/route';
type RootStackParamList = {
  InsuranceMain: { plan: string };
};

type InsuranceMainRouteProp = RouteProp<RootStackParamList, 'InsuranceMain'>;

export default function InsuranceMain() {
  const route = useRoute<InsuranceMainRouteProp>();
  const { plan } = route.params;

  const [insuranceData, setInsuranceData] = useState({
    insuranceFor: '',
    name: '',
    dob: '',
    gender: '',
    occupation: '',
    mobile: '',
    email: '',
    aadharImage: { front: false, back: false },
    aadharNumber: '',
    address: '',
    pincode: '',
    city: '',
    state: '',
    country: 'India',
    nominees: [],
  });

  const [showCustomerDatePicker, setShowCustomerDatePicker] = useState(false);
  const [showNomineeDatePicker, setShowNomineeDatePicker] = useState(false);
  const [nomineeModalVisible, setNomineeModalVisible] = useState(false);

  const [nomineeData, setNomineeData] = useState({
    relationship: '',
    name: '',
    dob: '',
    gender: '',
  });
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.planText}>Selected Plan: {plan}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
  },
  planText: {
    fontSize: 18,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    marginBottom: 15,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 15,
  },
  picker: {
    height: 50,
    padding: 10,
  },
  aadharContainer: {
    marginBottom: 15,
  },
  aadharLabel: {
    fontSize: 16,
    marginBottom: 10,
  },
  aadharButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  aadharButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    width: '48%',
  },
  addButton: {
    marginTop: 20,
  },
  disabledField: {
    backgroundColor: '#f0f0f0',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  nomineeButtonText: {
    color: "purple",
  },
  submitButton: {
    backgroundColor: "purple",
    padding: 10,
    borderRadius: 5,
    marginTop: 20
  }, submitButtonText: {
    color: "white",
    textAlign: "center"
  }
});
