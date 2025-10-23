import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { RegistrationFormData } from '../../types/registration';
import { registerDriver } from '../../services/api';

export default function ReviewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Parse the form data passed from registration screen
  const formData: RegistrationFormData = params.data ? JSON.parse(params.data as string) : {};
  const photoUri = params.photoUri as string;

  const handleGoBack = () => {
    router.back();
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Prepare registration data with photo
      const registrationData: RegistrationFormData = {
        ...formData,
        profilePhoto: photoUri ? {
          uri: photoUri,
          type: 'image/jpeg',
          name: 'profile.jpg',
        } : undefined,
      };

      await registerDriver(registrationData);
      router.replace('/(auth)/success');
    } catch (error: any) {
      Alert.alert('Submission Failed', error.message || 'Please try again');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        <View className="px-5 pt-12 pb-20">
          {/* Header */}
          <View className="flex-row items-center mb-6">
            <TouchableOpacity onPress={handleGoBack} className="mr-3">
              <Text className="text-2xl">←</Text>
            </TouchableOpacity>
            <Text className="text-xl font-semibold text-gray-900">Review Your Details</Text>
          </View>

          {/* Confirmation Message */}
          <Text className="text-base text-gray-600 mb-8">
            Please confirm that all information is correct.
          </Text>

          {/* Profile Photo */}
          {photoUri && (
            <View className="items-center mb-8">
              <View className="w-40 h-40 rounded-2xl overflow-hidden bg-gray-100">
                <Image
                  source={{ uri: photoUri }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              </View>
            </View>
          )}

          {/* Personal Information Section */}
          <View className="bg-white border border-gray-200 rounded-2xl p-5 mb-4">
            <Text className="text-lg font-bold text-gray-900 mb-4">Personal Information</Text>

            <View className="mb-4">
              <Text className="text-sm text-gray-500 mb-1">First Name</Text>
              <Text className="text-base text-gray-900 font-medium">{formData.firstName}</Text>
            </View>

            {formData.middleName && (
              <View className="mb-4">
                <Text className="text-sm text-gray-500 mb-1">Middle Name</Text>
                <Text className="text-base text-gray-900 font-medium">{formData.middleName}</Text>
              </View>
            )}

            <View className="mb-4">
              <Text className="text-sm text-gray-500 mb-1">Surname</Text>
              <Text className="text-base text-gray-900 font-medium">{formData.surname}</Text>
            </View>

            <View className="mb-4">
              <Text className="text-sm text-gray-500 mb-1">Birthdate</Text>
              <Text className="text-base text-gray-900 font-medium">{formatDate(formData.birthdate)}</Text>
            </View>

            <View>
              <Text className="text-sm text-gray-500 mb-1">Birthplace</Text>
              <Text className="text-base text-gray-900 font-medium">{formData.birthplace}</Text>
            </View>
          </View>

          {/* Driver's License Section */}
          <View className="bg-white border border-gray-200 rounded-2xl p-5 mb-4">
            <Text className="text-lg font-bold text-gray-900 mb-4">Driver's License</Text>

            <View className="mb-4">
              <Text className="text-sm text-gray-500 mb-1">License Number</Text>
              <Text className="text-base text-gray-900 font-medium">{formData.licenseNumber}</Text>
            </View>

            <View>
              <Text className="text-sm text-gray-500 mb-1">Expiry Date</Text>
              <Text className="text-base text-gray-900 font-medium">{formatDate(formData.licenseExpiryDate)}</Text>
            </View>
          </View>

          {/* Contact Details Section */}
          <View className="bg-white border border-gray-200 rounded-2xl p-5 mb-8">
            <Text className="text-lg font-bold text-gray-900 mb-4">Contact Details</Text>

            <View className="mb-4">
              <Text className="text-sm text-gray-500 mb-1">Email</Text>
              <Text className="text-base text-gray-900 font-medium">{formData.email}</Text>
            </View>

            <View className="mb-4">
              <Text className="text-sm text-gray-500 mb-1">Address Line 1</Text>
              <Text className="text-base text-gray-900 font-medium">{formData.addressLine1}</Text>
            </View>

            {formData.addressLine2 && (
              <View className="mb-4">
                <Text className="text-sm text-gray-500 mb-1">Address Line 2</Text>
                <Text className="text-base text-gray-900 font-medium">{formData.addressLine2}</Text>
              </View>
            )}

            <View className="mb-4">
              <Text className="text-sm text-gray-500 mb-1">Primary Phone</Text>
              <Text className="text-base text-gray-900 font-medium">{formData.primaryPhone}</Text>
            </View>

            {formData.secondaryPhone && (
              <View>
                <Text className="text-sm text-gray-500 mb-1">Secondary Phone</Text>
                <Text className="text-base text-gray-900 font-medium">{formData.secondaryPhone}</Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <TouchableOpacity
            onPress={handleGoBack}
            className="bg-white border-2 border-orange-600 rounded-full py-4 items-center mb-3"
          >
            <Text className="text-orange-600 text-lg font-semibold">Go Back & Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isSubmitting}
            className={`rounded-full py-4 items-center ${
              isSubmitting ? 'bg-gray-400' : 'bg-orange-600'
            }`}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-lg font-semibold">Confirm & Submit</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
