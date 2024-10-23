import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Button, Modal, PermissionsAndroid, Alert, ToastAndroid,
  ActivityIndicator
} from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import MatIcon from 'react-native-vector-icons/MaterialIcons';
import ImagePicker from 'react-native-image-crop-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import APIroute from '../../contants/route';

// Type definitions
interface InsuranceData {
  insuranceFor: string;
  name: string;
  dob: string;
  gender: string;
  occupation: string;
  mobile: string;
  email: string;
  aadharNumber: string;
  address: string;
  pincode: string;
  city: string;
  state: string;
  country: string;
  nominees: Nominee[];
}

interface Nominee {
  relationship: string;
  name: string;
  dob: string;
  gender: string;
}

type RootStackParamList = {
  InsuranceMain: { plan: string };
};

type InsuranceMainRouteProp = RouteProp<RootStackParamList, 'InsuranceMain'>;

const INITIAL_INSURANCE_DATA: InsuranceData = {
  insuranceFor: '',
  name: '',
  dob: '',
  gender: '',
  occupation: '',
  mobile: '',
  email: '',
  aadharNumber: '',
  address: '',
  pincode: '',
  city: '',
  state: '',
  country: 'India',
  nominees: [],
};

const INITIAL_NOMINEE_DATA: Nominee = {
  relationship: '',
  name: '',
  dob: '',
  gender: '',
};

export default function InsuranceMain() {
  const route = useRoute<InsuranceMainRouteProp>();
  const { plan } = route.params;

  const [insuranceData, setInsuranceData] = useState<InsuranceData>(INITIAL_INSURANCE_DATA);
  const [aadharFront, setAadharFront] = useState<string | null>(null);
  const [aadharBack, setAadharBack] = useState<string | null>(null);
  const [showCustomerDatePicker, setShowCustomerDatePicker] = useState(false);
  const [showNomineeDatePicker, setShowNomineeDatePicker] = useState(false);
  const [nomineeModalVisible, setNomineeModalVisible] = useState(false);
  const [nomineeData, setNomineeData] = useState<Nominee>(INITIAL_NOMINEE_DATA);
  const [isLoading, setIsLoading] = useState(false);

  const verifyAadhar = useCallback(async () => {
    if (!aadharFront || !aadharBack) return;

    setIsLoading(true);
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const refreshToken = await AsyncStorage.getItem('refreshToken');

      const { data } = await axios.post(
        `${APIroute}/verifyaadhar`,
        {
          back: aadharBack,
          front: aadharFront,
        },
        {
          headers: {
            authorization: accessToken,
            refreshtoken: refreshToken,
          }
        }
      );
      setInsuranceData((prevState) => ({
        ...prevState,
        address: data.ocrData.address,
        pincode: data.ocrData.pincode,
        aadharNumber: data.aadharNumber,
      }));

      // Handle successful verification
      ToastAndroid.show("Aadhar verified successfully", ToastAndroid.BOTTOM);
      return data?.ocrData;
    } catch (error: any) {
      console.error('Aadhar verification error:', error);
      if (error.response?.data?.status === "Invalid Aadhar") {
        ToastAndroid.show("Invalid Aadhar", ToastAndroid.BOTTOM);
      } else {
        ToastAndroid.show("Verification failed", ToastAndroid.BOTTOM);
      }
    } finally {
      setIsLoading(false);
    }
  }, [aadharBack, aadharFront]);

  useEffect(() => {
    if (aadharFront && aadharBack) {
      verifyAadhar();
    }
  }, [aadharFront, aadharBack, verifyAadhar]);

  const handleInputChange = useCallback((field: keyof InsuranceData, value: string) => {
    setInsuranceData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleNomineeInputChange = useCallback((field: keyof Nominee, value: string) => {
    setNomineeData(prev => ({ ...prev, [field]: value }));
  }, []);

  const addNominee = useCallback(() => {
    if (!validateNomineeData(nomineeData)) {
      ToastAndroid.show("Please fill all nominee details", ToastAndroid.BOTTOM);
      return;
    }

    setInsuranceData(prev => ({
      ...prev,
      nominees: [...prev.nominees, nomineeData],
    }));
    setNomineeData(INITIAL_NOMINEE_DATA);
    ToastAndroid.show("Nominee added successfully", ToastAndroid.SHORT);
  }, [nomineeData]);

  const handleSubmitNominees = useCallback(async () => {
    if (!validateInsuranceData(insuranceData)) {
      ToastAndroid.show("Please fill all required fields", ToastAndroid.BOTTOM);
      return;
    }
    setIsLoading(true);
    try {
      console.log(insuranceData);
      Alert.alert('Success', 'Insurance form submitted successfully');
      setInsuranceData(INITIAL_INSURANCE_DATA);                                                                      
      setNomineeModalVisible(false);
    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert('Error', 'Failed to submit insurance form');
    } finally {
      setIsLoading(false);
    }
  }, [insuranceData]);
  const onCustomerDateChange = (event: any, selectedDate?: Date) => {
    setShowCustomerDatePicker(false);
    if (selectedDate) {
      handleInputChange('dob', selectedDate.toISOString().split('T')[0]);
    }
  };

  const onNomineeDateChange = (event: any, selectedDate?: Date) => {
    setShowNomineeDatePicker(false);
    if (selectedDate) {
      handleNomineeInputChange('dob', selectedDate.toISOString().split('T')[0]);
    }
  };
  // Rest of your component remains the same...
  const showCustomerDOBPicker = () => {
    setShowCustomerDatePicker(true);
  };

  const showNomineeDOBPicker = () => {
    setShowNomineeDatePicker(true);
  };
  const requestCameraPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'This app needs access to your camera.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false; // Return false if there's an error
    }
  };
  const takePhoto = async (side: 'front' | 'back') => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      console.log('Camera access is required to take a photo');
      return; // Exit if permission not granted
    }
    try {
      const result = await ImagePicker.openCamera({
        width: 300,
        height: 400,
        cropping: true,
        includeBase64: true, // Include base64 for upload
      });

      console.log(result);
      if (result) {
        if (side === 'front') {
          setAadharFront(result.data);
        } else if (side === 'back') {
          setAadharBack(result.data);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleAddNominee = () => {
    setNomineeModalVisible(true);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {isLoading && <LoadingOverlay />}
      <Text style={styles.planText}>Selected Plan: {plan}</Text>

      <Text style={styles.sectionTitle}>Customer Details</Text>

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={insuranceData.insuranceFor}
          onValueChange={(itemValue) => handleInputChange("insuranceFor", itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Insurance For" value="" />
          <Picker.Item label="Spouse" value="spouse" />
          <Picker.Item label="Father" value="father" />
          <Picker.Item label="Mother" value="mother" />
          <Picker.Item label="Child" value="child" />
        </Picker>
      </View>

      <TextInput
        placeholder="Name"
        value={insuranceData.name}
        onChangeText={(value) => handleInputChange("name", value)}
        style={styles.input}
        keyboardType='default'
      />

      <TouchableOpacity onPress={showCustomerDOBPicker}>
        <TextInput
          placeholder="Date of Birth"
          value={insuranceData.dob}
          style={styles.input}
          editable={false}
        />
      </TouchableOpacity>

      {showCustomerDatePicker && (
        <DateTimePicker
          value={insuranceData.dob ? new Date(insuranceData.dob) : new Date()}
          display="default"
          onChange={onCustomerDateChange}
        />
      )}

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={insuranceData.gender}
          onValueChange={(itemValue) => handleInputChange("gender", itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Gender" value="" />
          <Picker.Item label="Male" value="male" />
          <Picker.Item label="Female" value="female" />
        </Picker>
      </View>

      <TextInput
        placeholder="Occupation"
        value={insuranceData.occupation}
        onChangeText={(value) => handleInputChange("occupation", value)}
        style={styles.input}
      />

      <TextInput
        placeholder="Mobile"
        value={insuranceData.mobile}
        onChangeText={(value) => handleInputChange("mobile", value)}
        style={styles.input}
        keyboardType="phone-pad"
        maxLength={10}
      />

      <TextInput
        placeholder="Email"
        value={insuranceData.email}
        onChangeText={(value) => handleInputChange("email", value)}
        style={styles.input}
        keyboardType="email-address"
      />

      <View style={styles.aadharContainer}>
        <Text style={styles.aadharLabel}>Upload Aadhar</Text>
        <View style={styles.aadharButtonsContainer}>
          <TouchableOpacity
            style={[styles.aadharButton, aadharFront ? { backgroundColor: 'green' } : null]}
            onPress={() => takePhoto('front')}
          >
            <MatIcon name="camera-alt" size={24} color={aadharFront ? '#fff' : '#000'} />
            <Text style={aadharFront ? { color: '#fff' } : null}>Front</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.aadharButton, aadharBack ? { backgroundColor: 'green' } : null]}
            onPress={() => takePhoto('back')}
          >
            <MatIcon name="camera-alt" size={24} color={aadharBack ? '#fff' : '#000'} />
            <Text style={aadharBack ? { color: '#fff' } : null}>Back</Text>
          </TouchableOpacity>
          {/* <TouchableOpacity
            style={[styles.aadharButton, insuranceData.aadharImage.front ? { backgroundColor: 'blue' } : null]}
            onPress={() => uploadPhoto('front')}
          >
            <Text style={insuranceData.aadharImage.front ? { color: '#fff' } : null}>Upload Front</Text>
          </TouchableOpacity> */}
          {/* <TouchableOpacity
            style={[styles.aadharButton, insuranceData.aadharImage.back ? { backgroundColor: 'blue' } : null]}
            onPress={() => uploadPhoto('back')}
          >
            <Text style={insuranceData.aadharImage.back ? { color: '#fff' } : null}>Upload Back</Text>
          </TouchableOpacity> */}
        </View>
      </View>

      <TextInput
        placeholder="Aadhar Number"
        value={insuranceData.aadharNumber}
        onChangeText={(value) => handleInputChange("aadharNumber", value)}
        style={styles.input}
        keyboardType="number-pad"
        maxLength={12}
        editable={false}
      />

      <TextInput
        placeholder="Address"
        value={insuranceData.address}
        onChangeText={(value) => handleInputChange("address", value)}
        style={styles.input}
        multiline
        editable={false}

      />

      <TextInput
        placeholder="Pincode"
        value={insuranceData.pincode}
        onChangeText={(value) => handleInputChange("pincode", value)}
        style={styles.input}
        keyboardType="number-pad"
        maxLength={6}
        editable={false}
      />

      <TextInput
        placeholder="City"
        value={insuranceData.city}
        onChangeText={(value) => handleInputChange("city", value)}
        style={styles.input}
      />

      <TextInput
        placeholder="State"
        value={insuranceData.state}
        onChangeText={(value) => handleInputChange("state", value)}
        style={styles.input}
      />

      <TextInput
        placeholder="Country"
        value={insuranceData.country}
        onChangeText={(value) => handleInputChange("country", value)}
        style={styles.input}
      />

      <TouchableOpacity onPress={handleAddNominee}>
        <Text style={styles.nomineeButtonText}>Add Nominee</Text>
      </TouchableOpacity>
      {/* Nominee Modal */}
      <Modal
        visible={nomineeModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setNomineeModalVisible(false)}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.modalTitle}>Nominee Details</Text>

          <TextInput
            placeholder="Relationship"
            value={nomineeData.relationship}
            onChangeText={(value) => handleNomineeInputChange("relationship", value)}
            style={styles.input}
          />

          <TextInput
            placeholder="Name"
            value={nomineeData.name}
            onChangeText={(value) => handleNomineeInputChange("name", value)}
            style={styles.input}
          />

          <TouchableOpacity onPress={showNomineeDOBPicker}>
            <TextInput
              placeholder="Date of Birth"
              value={nomineeData.dob}
              style={styles.input}
              editable={false}
            />
          </TouchableOpacity>

          {showNomineeDatePicker && (
            <DateTimePicker
              value={nomineeData.dob ? new Date(nomineeData.dob) : new Date()}
              display="default"
              onChange={onNomineeDateChange}
            />
          )}

          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={nomineeData.gender}
              onValueChange={(itemValue) => handleNomineeInputChange("gender", itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Gender" value="" />
              <Picker.Item label="Male" value="male" />
              <Picker.Item label="Female" value="female" />
            </Picker>
          </View>



          <TouchableOpacity onPress={addNominee} >
            <Text style={styles.nomineeButtonText}> Add New Nominee</Text>
          </TouchableOpacity>

          <Button title="Submit" onPress={handleSubmitNominees} />
        </ScrollView>
      </Modal>
    </ScrollView>
  );
}

// Validation functions
const validateNomineeData = (data: Nominee): boolean => {
  return Object.values(data).every(value => value !== '');
};

const validateInsuranceData = (data: InsuranceData): boolean => {
  const requiredFields = ['name', 'dob', 'gender', 'mobile', 'email', 'aadharNumber'];
  return requiredFields.every(field => data[field as keyof InsuranceData] !== '');
};

// Loading overlay component
const LoadingOverlay = () => (
  <View style={styles.loadingOverlay}>
    <ActivityIndicator size="large" color="#0000ff" />
  </View>
);

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
    color: "#0A66C2",
  },
  submitButton: {
    backgroundColor: "purple",
    padding: 10,
    borderRadius: 5,
    marginTop: 20
  }, submitButtonText: {
    color: "white",
    textAlign: "center"
  },
  loadingOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
});