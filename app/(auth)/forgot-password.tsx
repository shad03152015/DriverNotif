import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { sendPasswordResetLink } from '../../services/api';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendResetLink = async () => {
    // Validation
    if (!emailOrPhone.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Required Field',
        text2: 'Please enter your email or phone number',
        position: 'top',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await sendPasswordResetLink(emailOrPhone.trim());

      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'Reset Link Sent!',
          text2: response.message || 'Check your email for password reset instructions',
          position: 'top',
          visibilityTime: 5000,
        });

        // Clear input
        setEmailOrPhone('');

        // Navigate back to login after 2 seconds
        setTimeout(() => {
          router.back();
        }, 2000);
      }
    } catch (error: any) {
      // Check if error is "Email does not exist"
      if (error.message.toLowerCase().includes('not found') ||
          error.message.toLowerCase().includes('does not exist')) {
        Toast.show({
          type: 'error',
          text1: 'Email does not exist!',
          text2: 'Please check and try again',
          position: 'top',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: error.message || 'Unable to send reset link. Please try again.',
          position: 'top',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 px-6 pt-20 pb-8">
            {/* Logo/Brand Area */}
            <View className="items-center mb-12">
              <View className="w-24 h-24 bg-orange-100 rounded-full items-center justify-center mb-6">
                <Text className="text-5xl">🚗</Text>
              </View>
              <Text className="text-2xl font-bold text-gray-900">
                HotRider
              </Text>
            </View>

            {/* Title */}
            <Text className="text-3xl font-bold text-gray-900 mb-3">
              Reset Your Password
            </Text>

            {/* Subtitle */}
            <Text className="text-base text-gray-500 mb-10 leading-6">
              Enter the email or phone number associated with your account, and we'll send you a link to reset your password.
            </Text>

            {/* Email or Phone Number Input */}
            <View className="mb-8">
              <Text className="text-base font-medium text-gray-900 mb-2">
                Email or Phone Number
              </Text>
              <TextInput
                className="bg-white border border-gray-300 rounded-xl px-4 py-4 text-base text-gray-900"
                placeholder="Enter your email or phone number"
                placeholderTextColor="#9CA3AF"
                value={emailOrPhone}
                onChangeText={setEmailOrPhone}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
              />
            </View>

            {/* Send Reset Link Button */}
            <TouchableOpacity
              onPress={handleSendResetLink}
              disabled={isLoading}
              className={`rounded-full py-4 items-center mb-8 ${
                isLoading ? 'bg-gray-400' : 'bg-orange-600'
              }`}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-lg font-semibold">
                  Send Reset Link
                </Text>
              )}
            </TouchableOpacity>

            {/* Back to Login Link */}
            <TouchableOpacity
              onPress={handleBackToLogin}
              className="flex-row items-center justify-center"
            >
              <Text className="text-2xl mr-2">←</Text>
              <Text className="text-gray-600 text-base font-medium">
                Back to Login
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Toast Container */}
        <Toast />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
