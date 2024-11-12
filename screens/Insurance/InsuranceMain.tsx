import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, PermissionsAndroid, Alert, ToastAndroid,
  ActivityIndicator, Pressable, ActionSheetIOS, Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import MatIcon from 'react-native-vector-icons/MaterialIcons';
import ImagePicker from 'react-native-image-crop-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import APIroute from '../../constants/route';
import boxes from '../../constants/insuranceplans';
// Type definitions
interface InsuranceData {
  customerDetails: {
    customerName: string;
    customerContactNumber: string;
  };
  insuranceFor: string;
  insuranceBy: string;
  insurancePlan: string;
  source: 'AGENT APP'
  name: string;
  dob: string;
  gender: string;
  occupation: string;
  mobile: string;
  email: string;
  aadharNumber: string;
  aadharImage: {
    front: string | null;
    back: string | null;
    ocrData: Record<string, any>;
  };
  address: string;
  pincode: string;
  city: string;
  state: string;
  country: string;
}

type RootStackParamList = {
  InsuranceMain: { plan: string };
};

type InsuranceMainRouteProp = RouteProp<RootStackParamList, 'InsuranceMain'>;
const INITIAL_INSURANCE_DATA: InsuranceData = {
  insuranceFor: "",
  insuranceBy: "",
  source: 'AGENT APP',
  insurancePlan: "",
  name: "",
  dob: "",
  gender: "",
  occupation: "",
  mobile: "",
  email: "",
  aadharNumber: "",
  aadharImage: {
    front: null,
    back: null,
    ocrData: {},
  },
  customerDetails: {
    customerName: '',
    customerContactNumber: "",
  },
  address: "",
  pincode: "",
  city: "",
  state: "",
  country: 'India',
};

export default function InsuranceMain() {
  const { navigate } = useNavigation<any>();
  const route = useRoute<InsuranceMainRouteProp>();
  const { plan } = route.params;
  const PlanDetails = boxes.filter(box => box.label === plan);
  const [insuranceData, setInsuranceData] = useState<InsuranceData>(INITIAL_INSURANCE_DATA);
  const [aadharFront, setAadharFront] = useState<string | null>(null);
  const [aadharBack, setAadharBack] = useState<string | null>(null);
  const [showCustomerDatePicker, setShowCustomerDatePicker] = useState(false);
  const [isPhotoUploaded, setIsPhotoUploaded] = useState(false);
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
        aadharImage: {
          front: aadharFront,
          back: aadharBack,
          ocrData: data.ocrData,
        },
      }));
      // Handle successful verification
      ToastAndroid.show("Aadhar verified successfully", ToastAndroid.BOTTOM);
      return data?.ocrData;
    } catch (error: any) {
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

  const handleInputChange = useCallback((field: keyof InsuranceData | 'customerName' | 'customerContactNumber', value: string) => {
    setInsuranceData(prev => {
      if (field === 'customerName' || field === 'customerContactNumber') {
        return {
          ...prev,
          customerDetails: {
            ...prev.customerDetails,
            [field]: value,
          },
        };
      }
      return { ...prev, [field]: value };
    });
  }, []);

  const onCustomerDateChange = (event: any, selectedDate?: Date) => {
    setShowCustomerDatePicker(false);
    if (selectedDate) {
      handleInputChange('dob', selectedDate.toISOString().split('T')[0]);
    }
  };

  const showCustomerDOBPicker = () => {
    setShowCustomerDatePicker(true);
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
      return false; 
    }
  };
  
  const requestGalleryPermission = async () => {
    try {
      const androidVersion = Platform.Version;
      if (androidVersion >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          {
            title: 'Gallery Permission',
            message: 'This app needs access to your gallery.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: 'Gallery Permission',
            message: 'This app needs access to your gallery.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    } catch (err) {
      console.warn(err);
      return false;
    }
  };
  
  const takePhoto = async (side: 'front' | 'back') => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      ToastAndroid.show('Camera access is required to take a photo', ToastAndroid.BOTTOM);
      return; 
    }
    try {
      const result = await ImagePicker.openCamera({
        width: 300,
        height: 400,
        cropping: true,
        includeBase64: true, 
      });

      if (result && result.data) {
        if (side === 'front') {
          setAadharFront(result.data);
          ToastAndroid.show('Front image uploaded successfully', ToastAndroid.SHORT);
        } else if (side === 'back') {
          setAadharBack(result.data);
          ToastAndroid.show('Back image uploaded successfully', ToastAndroid.SHORT);
        }
      }
    } catch (error) {
      ToastAndroid.show("Failed to take photo", ToastAndroid.BOTTOM);
    }
  };
;
  
  // Updated image upload function
  const uploadImage = async (side: 'front' | 'back') => {
    try {
      const hasPermission = await requestGalleryPermission();  
      if (!hasPermission) {
        ToastAndroid.show('Gallery permission is required to upload photos', ToastAndroid.BOTTOM);
        return;
      }
      const result = await ImagePicker.openPicker({
        width: 300,
        height: 400,
        cropping: true,
        includeBase64: true,
        mediaType: 'photo',
      });
  
      if (result && result.data) {
        if (side === 'front') {
          setAadharFront(result.data);
          ToastAndroid.show('Front image uploaded successfully', ToastAndroid.SHORT);
        } else if (side === 'back') {
          setAadharBack(result.data);
          ToastAndroid.show('Back image uploaded successfully', ToastAndroid.SHORT);
        }
      }
    } catch (error: any) {
       ToastAndroid.show("Failed to upload image", ToastAndroid.BOTTOM);
    }
  };

  const handleAddNominee = () => {
    if (!validateInsuranceData(insuranceData)) {
      ToastAndroid.show("Please fill all the fields", ToastAndroid.BOTTOM);
      return;
    }
    if (insuranceData.customerDetails.customerContactNumber.length !== 10) {
      ToastAndroid.show("Please enter a valid mobile number of customer", ToastAndroid.BOTTOM);
      return;
    }
    if (insuranceData.mobile.length !== 10) {
      ToastAndroid.show("Please enter a valid mobile number", ToastAndroid.BOTTOM);
      return;
    }
    navigate("NomineeForm", { insuranceData: insuranceData, plan: plan });
  };
  const handleButtonPress = (side: 'front' | 'back') => {
    if (Platform.OS === 'ios') {
      // iOS Action Sheet
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Upload Photo'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            // Take photo
            takePhoto(side);
          } else if (buttonIndex === 2) {
            // Upload image
            uploadImage(side);
            setIsPhotoUploaded(true); // Update the status to reflect upload
          }
        }
      );
    } else {
      // Android alert prompt
      Alert.alert(
        "Choose an option",
        "Do you want to take a new photo or upload an existing one?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Take Photo", onPress: () => takePhoto(side) },
          {
            text: "Upload Photo", onPress: () => {
              uploadImage(side);
            }
          }
        ]
      );
    }
  };


  return (
    <ScrollView contentContainerStyle={styles.container}>
      {isLoading && <LoadingOverlay />}
      <Text style={styles.planText}>Selected Plan: {plan}</Text>

      <Text style={styles.sectionTitle}>Customer Details</Text>
      <TextInput
        placeholder="Customer Buying Plan"
        value={insuranceData.customerDetails.customerName}
        onChangeText={(value) => handleInputChange('customerName', value)}
        style={styles.input}
        keyboardType='default'
      />
      <TextInput
        placeholder="Customer Contact Number"
        value={insuranceData.customerDetails.customerContactNumber}
        onChangeText={(value) => handleInputChange('customerContactNumber', value)}
        style={styles.input}
        keyboardType='phone-pad'
      />
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={insuranceData.insuranceFor}
          onValueChange={(itemValue) => handleInputChange("insuranceFor", itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Insurance For" value="" />
          <Picker.Item label="Self" value="self" />
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
        <View style={styles.aadharButtons}>
          <Pressable
            style={[
              styles.aadharButton,
              aadharFront ? { backgroundColor: 'green' } : null,
            ]}
            onPress={() => handleButtonPress('front')}
          >
            <MatIcon name="camera-alt" size={24} color={aadharFront ? '#fff' : '#000'} />
            <Text style={aadharFront ? { color: '#fff' } : null}>
              {aadharFront ? "Photo Uploaded" : "Front"}
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.aadharButton,
              aadharBack ? { backgroundColor: 'green' } : null,
            ]}
            onPress={() => handleButtonPress('back')}
          >
            <MatIcon name="camera-alt" size={24} color={aadharBack ? '#fff' : '#000'} />
            <Text style={aadharBack ? { color: '#fff' } : null}>
              {aadharBack ? "Photo Uploaded" : "Back"}
            </Text>
          </Pressable>
        </View>


        {/* <View style={styles.aadharButtonsContainer}>
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
          <TouchableOpacity
            style={[styles.aadharButton, insuranceData.aadharImage.front ? { backgroundColor: 'blue' } : null]}
            onPress={() => uploadImage('front')}
          >
            <Text style={insuranceData.aadharImage.front ? { color: '#fff' } : null}>Upload Front</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.aadharButton, insuranceData.aadharImage.back ? { backgroundColor: 'blue' } : null]}
            onPress={() => uploadImage('back')}
          >
            <Text style={insuranceData.aadharImage.back ? { color: '#fff' } : null}>Upload Back</Text>
          </TouchableOpacity>
        </View> */}

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

      <TouchableOpacity onPress={handleAddNominee} style={styles.nomineeButton}>
        <Text style={styles.nomineeButtonText}>Add Nominee</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}


const validateInsuranceData = (data: InsuranceData): boolean => {
  const requiredFields = ['name', 'dob', 'gender', 'mobile', 'email', 'aadharNumber', 'address', 'pincode', 'city', 'state', 'country'];
  return requiredFields.every(field => data[field as keyof InsuranceData] !== '');
};

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
  aadharButtons:{
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
  nomineeButton: {
    backgroundColor: "#0e4985",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  nomineeButtonText: {
    textAlign: "center",
    color: "white",
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