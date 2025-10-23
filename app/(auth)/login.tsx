import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginDriver } from '../../services/api';

export default function LoginScreen() {
  const router = useRouter();
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    // Validation
    if (!emailOrUsername.trim()) {
      Alert.alert('Required Field', 'Please enter your email or username');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Required Field', 'Please enter your password');
      return;
    }

    setIsLoading(true);

    try {
      const response = await loginDriver({
        emailOrUsername: emailOrUsername.trim(),
        password: password,
      });

      if (response.success && response.data) {
        // Store authentication token
        await AsyncStorage.setItem('access_token', response.data.access_token);
        await AsyncStorage.setItem('driver_id', response.data.driver_id);
        await AsyncStorage.setItem('driver_email', response.data.email);
        await AsyncStorage.setItem('driver_name', `${response.data.first_name} ${response.data.surname}`);

        // Navigate to main app (placeholder for now)
        Alert.alert('Success', 'Login successful!', [
          {
            text: 'OK',
            onPress: () => {
              // TODO: Navigate to main driver app dashboard
              router.replace('/');
            },
          },
        ]);
      }
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Please check your credentials and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    router.push('/(auth)/forgot-password');
  };

  const handleQuickLogin = () => {
    Alert.alert('Quick Login', 'Biometric authentication coming soon!');
  };

  const handleRegister = () => {
    router.push('/(auth)/registration');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <ScrollView
        contentContainerClassName="flex-grow"
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 px-6 pt-20 pb-8">
          {/* Logo/Brand Area */}
          <View className="items-center mb-8">
            <View className="w-32 h-20 bg-gray-100 rounded-2xl items-center justify-center mb-8">
              <Text className="text-gray-400 text-xs">HOTRIDE LOGO</Text>
            </View>
          </View>

          {/* Welcome Text */}
          <Text className="text-4xl font-bold text-gray-900 mb-2">
            Welcome, Rider
          </Text>
          <Text className="text-base text-gray-500 mb-10">
            Log in to start driving
          </Text>

          {/* Email or Username Input */}
          <View className="mb-4">
            <Text className="text-base font-medium text-gray-900 mb-2">
              Email or Username
            </Text>
            <TextInput
              className="bg-white border border-gray-300 rounded-xl px-4 py-4 text-base text-gray-900"
              placeholder="Enter your email or username"
              placeholderTextColor="#9CA3AF"
              value={emailOrUsername}
              onChangeText={setEmailOrUsername}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
          </View>

          {/* Password Input */}
          <View className="mb-2">
            <Text className="text-base font-medium text-gray-900 mb-2">
              Password
            </Text>
            <View className="relative">
              <TextInput
                className="bg-white border border-gray-300 rounded-xl px-4 py-4 text-base text-gray-900 pr-12"
                placeholder="Enter your password"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-4"
              >
                <Text className="text-2xl">{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Forgot Password Link */}
          <TouchableOpacity onPress={handleForgotPassword} className="self-end mb-8">
            <Text className="text-base text-orange-600 font-medium">
              Forgot Password?
            </Text>
          </TouchableOpacity>

          {/* Log In Button */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={isLoading}
            className={`rounded-full py-4 items-center mb-6 ${
              isLoading ? 'bg-gray-400' : 'bg-orange-600'
            }`}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-lg font-semibold">Log In</Text>
            )}
          </TouchableOpacity>

          {/* Or Divider */}
          <View className="flex-row items-center mb-6">
            <View className="flex-1 h-px bg-gray-300" />
            <Text className="mx-4 text-gray-500 text-sm">Or</Text>
            <View className="flex-1 h-px bg-gray-300" />
          </View>

          {/* Quick Login Button */}
          <TouchableOpacity
            onPress={handleQuickLogin}
            className="bg-white border border-gray-300 rounded-full py-4 flex-row items-center justify-center mb-8"
          >
            <Text className="text-2xl mr-3">🔒</Text>
            <Text className="text-gray-900 text-lg font-medium">Quick Login</Text>
          </TouchableOpacity>

          {/* Register Link */}
          <View className="flex-row items-center justify-center">
            <Text className="text-gray-600 text-base">
              Don't have an account?{' '}
            </Text>
            <TouchableOpacity onPress={handleRegister}>
              <Text className="text-orange-600 text-base font-semibold">
                Register
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
