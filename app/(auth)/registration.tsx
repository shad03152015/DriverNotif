import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import * as ImagePicker from 'expo-image-picker';
import { RegistrationFormData, AuthProvider } from '../../types/registration';
import {
  validateEmail,
  validateRequired,
  validateMinLength,
  formatPhoneNumber,
} from '../../utils/validation';

export default function RegistrationScreen() {
  const router = useRouter();
  const { control, handleSubmit, formState: { errors }, setValue, watch } = useForm<RegistrationFormData>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<any>(null);
  const [authProvider, setAuthProvider] = useState<AuthProvider>('email');

  const onSubmit = async (data: RegistrationFormData) => {
    // Navigate to review screen with form data
    const formDataWithProvider = {
      ...data,
      authProvider,
    };

    router.push({
      pathname: '/(auth)/review',
      params: {
        data: JSON.stringify(formDataWithProvider),
        photoUri: profilePhoto?.uri || '',
      },
    });
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setProfilePhoto(result.assets[0]);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="px-5 pt-10 pb-20">
        {/* Header */}
        <Text className="text-lg font-semibold text-gray-800 mb-2">Driver Registration</Text>
        <Text className="text-3xl font-bold text-black mb-8">Become a HotRider{'\n'}Driver</Text>

        {/* Quick Start Section */}
        <View className="mb-8">
          <Text className="text-base font-semibold text-gray-900 mb-2">Quick Start</Text>
          <Text className="text-sm text-gray-600 mb-4">Enter your email to begin your registration.</Text>

          <Controller
            control={control}
            name="email"
            rules={{
              required: 'Email is required',
              validate: validateEmail,
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="bg-white border border-gray-300 rounded-lg px-3 py-3 text-base"
                placeholder="Enter your email address"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            )}
          />
          {errors.email && <Text className="text-red-500 text-sm mt-1">{errors.email.message}</Text>}
        </View>

        {/* Profile Photo */}
        <View className="mb-8">
          <Text className="text-base font-semibold text-gray-900 mb-2">Your Profile Photo</Text>
          <Text className="text-sm text-gray-600 mb-4">Upload a clear, forward-facing photo.</Text>

          <TouchableOpacity
            onPress={pickImage}
            className={`rounded-xl py-12 items-center justify-center ${
              profilePhoto ? 'border-2 border-green-500' : 'border-2 border-dashed border-gray-300 bg-gray-50'
            }`}
          >
            <Text className="text-gray-600 text-center">
              {profilePhoto ? '✓ Photo Selected\nTap to Change' : '📷\nUpload Photo\nTap to select from device'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Personal Details */}
        <View className="mb-8">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Personal Details</Text>

          <Text className="text-sm text-gray-700 mb-1">First Name</Text>
          <Controller
            control={control}
            name="firstName"
            rules={{
              required: 'First name is required',
              validate: (value) => validateMinLength(value, 2, 'First name'),
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="bg-white border border-gray-300 rounded-lg px-3 py-3 text-base mb-4"
                placeholder="Enter your first name"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            )}
          />
          {errors.firstName && <Text className="text-red-500 text-sm mb-4">{errors.firstName.message}</Text>}

          <Text className="text-sm text-gray-700 mb-1">Middle Name (Optional)</Text>
          <Controller
            control={control}
            name="middleName"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="bg-white border border-gray-300 rounded-lg px-3 py-3 text-base mb-4"
                placeholder="Enter your middle name"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            )}
          />

          <Text className="text-sm text-gray-700 mb-1">Surname</Text>
          <Controller
            control={control}
            name="surname"
            rules={{
              required: 'Surname is required',
              validate: (value) => validateMinLength(value, 2, 'Surname'),
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="bg-white border border-gray-300 rounded-lg px-3 py-3 text-base mb-4"
                placeholder="Enter your surname"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            )}
          />
          {errors.surname && <Text className="text-red-500 text-sm mb-4">{errors.surname.message}</Text>}

          <Text className="text-sm text-gray-700 mb-1">Birthdate</Text>
          <Controller
            control={control}
            name="birthdate"
            rules={{ required: 'Birthdate is required' }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="bg-white border border-gray-300 rounded-lg px-3 py-3 text-base mb-4"
                placeholder="YYYY-MM-DD"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            )}
          />
          {errors.birthdate && <Text className="text-red-500 text-sm mb-4">{errors.birthdate.message}</Text>}

          <Text className="text-sm text-gray-700 mb-1">Birthplace</Text>
          <Controller
            control={control}
            name="birthplace"
            rules={{ required: 'Birthplace is required' }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="bg-white border border-gray-300 rounded-lg px-3 py-3 text-base mb-4"
                placeholder="City, Country"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            )}
          />
          {errors.birthplace && <Text className="text-red-500 text-sm mb-4">{errors.birthplace.message}</Text>}
        </View>

        {/* License & Contact Information */}
        <View className="mb-8">
          <Text className="text-lg font-semibold text-gray-900 mb-4">License & Contact Information</Text>

          <Text className="text-sm text-gray-700 mb-1">Driver License Number</Text>
          <Controller
            control={control}
            name="licenseNumber"
            rules={{ required: 'License number is required' }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="bg-white border border-gray-300 rounded-lg px-3 py-3 text-base mb-4"
                placeholder="Enter license number"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            )}
          />
          {errors.licenseNumber && <Text className="text-red-500 text-sm mb-4">{errors.licenseNumber.message}</Text>}

          <Text className="text-sm text-gray-700 mb-1">License Expiry Date</Text>
          <Controller
            control={control}
            name="licenseExpiryDate"
            rules={{ required: 'License expiry date is required' }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="bg-white border border-gray-300 rounded-lg px-3 py-3 text-base mb-4"
                placeholder="YYYY-MM-DD"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            )}
          />
          {errors.licenseExpiryDate && <Text className="text-red-500 text-sm mb-4">{errors.licenseExpiryDate.message}</Text>}

          <Text className="text-sm text-gray-700 mb-1">Address Line 1</Text>
          <Controller
            control={control}
            name="addressLine1"
            rules={{ required: 'Address is required' }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="bg-white border border-gray-300 rounded-lg px-3 py-3 text-base mb-4"
                placeholder="Street name and number"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            )}
          />
          {errors.addressLine1 && <Text className="text-red-500 text-sm mb-4">{errors.addressLine1.message}</Text>}

          <Text className="text-sm text-gray-700 mb-1">Address Line 2 (Optional)</Text>
          <Controller
            control={control}
            name="addressLine2"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="bg-white border border-gray-300 rounded-lg px-3 py-3 text-base mb-4"
                placeholder="Apartment, suite, etc."
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            )}
          />

          <Text className="text-sm text-gray-700 mb-1">Primary Phone Number</Text>
          <Controller
            control={control}
            name="primaryPhone"
            rules={{ required: 'Phone number is required' }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="bg-white border border-gray-300 rounded-lg px-3 py-3 text-base mb-4"
                placeholder="(123) 456-7890"
                value={value}
                onChangeText={(text) => onChange(formatPhoneNumber(text))}
                onBlur={onBlur}
                keyboardType="phone-pad"
              />
            )}
          />
          {errors.primaryPhone && <Text className="text-red-500 text-sm mb-4">{errors.primaryPhone.message}</Text>}

          <Text className="text-sm text-gray-700 mb-1">Secondary Phone Number (Optional)</Text>
          <Controller
            control={control}
            name="secondaryPhone"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="bg-white border border-gray-300 rounded-lg px-3 py-3 text-base mb-4"
                placeholder="Enter secondary phone number"
                value={value}
                onChangeText={(text) => onChange(formatPhoneNumber(text))}
                onBlur={onBlur}
                keyboardType="phone-pad"
              />
            )}
          />
        </View>

        {/* Important Note */}
        <View className="bg-yellow-100 border border-yellow-400 rounded-lg p-3 mb-4">
          <Text className="text-yellow-900 text-sm">⚠️ Note: Registration is valid for one year and requires annual renewal.</Text>
        </View>

        {/* Terms */}
        <Text className="text-sm text-gray-600 text-center mb-6">
          By submitting, you agree to our{' '}
          <Text className="text-blue-600 underline">Terms of Service</Text> and{' '}
          <Text className="text-blue-600 underline">Privacy Policy</Text>
        </Text>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className={`rounded-full py-4 items-center ${
            isSubmitting ? 'bg-gray-400' : 'bg-orange-600'
          }`}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white text-lg font-semibold">Review Details</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
