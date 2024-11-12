import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
    Modal, Alert, Switch, Platform
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import APIroute from '../../constants/route';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
interface Nominee {
    relationship: string;
    name: string;
    dob: string;
    gender: string;
    isMinor: boolean;
    guardianName: string;
    guardianAge: number;
    guardianRelationship: string;
}

interface ValidationErrors {
    [key: string]: string;
}

const INITIAL_NOMINEE_DATA: Nominee = {
    relationship: "",
    name: "",
    dob: "",
    gender: "",
    isMinor: false,
    guardianName: "",
    guardianAge: 0,
    guardianRelationship: "",
};

const NomineeForm = () => {
    const { navigate } = useNavigation<any>();
    const { params } = useRoute<any>();
    const { insuranceData, plan } = params;
    const [nomineeData, setNomineeData] = useState<Nominee>(INITIAL_NOMINEE_DATA);
    const [showNomineeDatePicker, setShowNomineeDatePicker] = useState(false);
    const [isMinor, setIsMinor] = useState(false);
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [loading, setLoading] = useState(false);

    const validateForm = (): boolean => {
        const newErrors: ValidationErrors = {};

        if (!nomineeData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!nomineeData.relationship.trim()) {
            newErrors.relationship = 'Relationship is required';
        }

        if (!nomineeData.dob) {
            newErrors.dob = 'Date of Birth is required';
        } else {
            const age = calculateAge(new Date(nomineeData.dob));
            if (age > 100) {
                newErrors.dob = 'Please enter a valid date of birth';
            }
        }

        if (!nomineeData.gender) {
            newErrors.gender = 'Gender is required';
        }

        if (isMinor) {
            if (!nomineeData.guardianName.trim()) {
                newErrors.guardianName = 'Guardian name is required';
            }

            if (!nomineeData.guardianAge) {
                newErrors.guardianAge = 'Guardian age is required';
            } else if (nomineeData.guardianAge < 18 || nomineeData.guardianAge > 100) {
                newErrors.guardianAge = 'Guardian age must be between 18 and 100';
            }

            if (!nomineeData.guardianRelationship.trim()) {
                newErrors.guardianRelationship = 'Guardian relationship is required';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const calculateAge = (birthDate: Date): number => {
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const handleNomineeInputChange = useCallback((field: keyof Nominee, value: string | boolean | number) => {
        setNomineeData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        setErrors(prev => ({ ...prev, [field]: '' }));
    }, []);

    const onNomineeDateChange = (event: any, selectedDate?: Date) => {
        setShowNomineeDatePicker(false);
        if (selectedDate) {
            const age = calculateAge(selectedDate);
            handleNomineeInputChange('dob', selectedDate.toISOString().split('T')[0]);
            setIsMinor(age < 18);
        }
    };

    const showNomineeDOBPicker = () => {
        setShowNomineeDatePicker(true);
    };

    const handleMinorToggle = (value: boolean) => {
        setIsMinor(value);
        if (!value) {
            setNomineeData(prev => ({
                ...prev,
                guardianName: '',
                guardianAge: 0,
                guardianRelationship: ''
            }));
            // Clear guardian-related errors
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.guardianName;
                delete newErrors.guardianAge;
                delete newErrors.guardianRelationship;
                return newErrors;
            });
        }
    };

    const handleSubmitNominees = useCallback(async () => {
        const accessToken = await AsyncStorage.getItem('accessToken');
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (!validateForm()) {
            Alert.alert('Error', 'Please fill all required fields correctly');
            return;
        }
        let totalPremium = 0;
        if (plan == "Plan A") {
            totalPremium = 150;
        } else {
            totalPremium = 275;
        }

        try {
            setLoading(true);
            // Your API call here
            const body = {
                insuranceDetails: {
                    ...insuranceData
                },
                nomineeDetails: {
                    ...nomineeData
                },
                plan: plan,
                totalPremium: totalPremium
            }
            const responce = await axios.post(`${APIroute}/insurance/new/agent`, body, {
                headers: {
                    authorization: `${accessToken}`,
                    refreshtoken: `${refreshToken}`,
                }
            });
            if (responce.data.success) {
                Alert.alert('Success', responce.data.message);
                navigate("Home" );
            
            }
            setNomineeData(INITIAL_NOMINEE_DATA);
            setIsMinor(false);
            
        } catch (error) {
            Alert.alert('Error', 'Failed to add nominee details. Please try again.');
            navigate("InsuranceOptions");
        } finally {
            setLoading(false);
        }
    }, [nomineeData, validateForm]);

    const renderError = (field: string) => {
        return errors[field] ? (
            <Text style={styles.errorText}>{errors[field]}</Text>
        ) : null;
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.modalTitle}>Add Nominee Details</Text>

            <TextInput
                placeholder="Relationship *"
                value={nomineeData.relationship}
                onChangeText={(value) => handleNomineeInputChange("relationship", value)}
                style={[styles.input, errors.relationship && styles.inputError]}
            />
            {renderError('relationship')}

            <TextInput
                placeholder="Name *"
                value={nomineeData.name}
                onChangeText={(value) => handleNomineeInputChange("name", value)}
                style={[styles.input, errors.name && styles.inputError]}
            />
            {renderError('name')}

            <TouchableOpacity onPress={showNomineeDOBPicker}>
                <TextInput
                    placeholder="Date of Birth *"
                    value={nomineeData.dob}
                    style={[styles.input, errors.dob && styles.inputError]}
                    editable={false}
                />
            </TouchableOpacity>
            {renderError('dob')}

            {showNomineeDatePicker && (
                <DateTimePicker
                    value={nomineeData.dob ? new Date(nomineeData.dob) : new Date()}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onNomineeDateChange}
                    maximumDate={new Date()}
                />
            )}

            <View style={[styles.pickerContainer, errors.gender && styles.inputError]}>
                <Picker
                    selectedValue={nomineeData.gender}
                    onValueChange={(itemValue) => handleNomineeInputChange("gender", itemValue)}
                    style={styles.picker}
                >
                    <Picker.Item label="Select Gender *" value="" />
                    <Picker.Item label="Male" value="male" />
                    <Picker.Item label="Female" value="female" />
                    <Picker.Item label="Other" value="other" />
                </Picker>
            </View>
            {renderError('gender')}

            <View style={styles.minorToggleContainer}>
                <Text style={styles.minorToggleText}>Is Nominee a Minor?</Text>
                <Switch
                    value={isMinor}
                    onValueChange={handleMinorToggle}
                />
            </View>

            {isMinor && (
                <>
                    <TextInput
                        placeholder="Guardian Name *"
                        value={nomineeData.guardianName}
                        onChangeText={(value) => handleNomineeInputChange("guardianName", value)}
                        style={[styles.input, errors.guardianName && styles.inputError]}
                    />
                    {renderError('guardianName')}

                    <TextInput
                        placeholder="Guardian Age *"
                        value={nomineeData.guardianAge?.toString()}
                        onChangeText={(value) => handleNomineeInputChange("guardianAge", parseInt(value) || 0)}
                        style={[styles.input, errors.guardianAge && styles.inputError]}
                        keyboardType="number-pad"
                    />
                    {renderError('guardianAge')}

                    <TextInput
                        placeholder="Guardian Relationship *"
                        value={nomineeData.guardianRelationship}
                        onChangeText={(value) => handleNomineeInputChange("guardianRelationship", value)}
                        style={[styles.input, errors.guardianRelationship && styles.inputError]}
                    />
                    {renderError('guardianRelationship')}
                </>
            )}

            <TouchableOpacity
                onPress={handleSubmitNominees}
                style={[styles.nomineeButton, loading && styles.disabledButton]}
                disabled={loading}
            >
                <Text style={styles.nomineeButtonText}>
                    {loading ? 'Adding Nominee...' : 'Add Nominee'}
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    modalTitle: {
        fontSize: 20,
        marginBottom: 20,
        fontWeight: 'bold',
        color: '#0e4985',
    },
    input: {
        marginBottom: 8,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    inputError: {
        borderColor: '#ff3b30',
    },
    errorText: {
        color: '#ff3b30',
        fontSize: 12,
        marginBottom: 8,
        marginLeft: 4,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        marginBottom: 8,
        backgroundColor: '#fff',
    },
    picker: {
        height: 50,
        padding: 10,
    },
    minorToggleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 15,
        padding: 8,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
    },
    minorToggleText: {
        fontSize: 16,
        marginRight: 10,
        color: '#333',
        flex: 1,
    },
    nomineeButton: {
        backgroundColor: "#0e4985",
        padding: 10,
        borderRadius: 8,
        marginTop: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    disabledButton: {
        backgroundColor: "#93b8e0",
    },
    nomineeButtonText: {
        textAlign: "center",
        color: "white",
        fontSize: 16,
        fontWeight: "600",
    },
});

export default NomineeForm;