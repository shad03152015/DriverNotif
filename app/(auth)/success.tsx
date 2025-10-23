import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

export default function SuccessScreen() {
  const router = useRouter();

  const handleDone = () => {
    router.replace('/');
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 px-6 pt-20 pb-10 items-center">
        {/* Success Icon */}
        <View className="w-20 h-20 bg-green-500 rounded-full items-center justify-center mb-5">
          <Text className="text-white text-4xl">✓</Text>
        </View>

        {/* Header */}
        <Text className="text-2xl font-bold text-gray-900 text-center mb-3">
          Registration Submitted!
        </Text>

        {/* Message */}
        <Text className="text-base text-gray-600 text-center mb-8">
          We'll review your application within 24-48 hours.
        </Text>

        {/* Timeline Section */}
        <View className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4 mb-8">
          {/* Step 1 - Completed */}
          <View className="flex-row items-center mb-4">
            <View className="w-6 h-6 bg-green-500 rounded-full items-center justify-center mr-3">
              <Text className="text-white text-xs font-bold">✓</Text>
            </View>
            <Text className="text-gray-900 font-semibold">Application Submitted</Text>
          </View>

          {/* Step 2 - Current */}
          <View className="flex-row items-center mb-4">
            <View className="w-6 h-6 bg-gray-300 rounded-full items-center justify-center mr-3">
              <Text className="text-white text-xs font-bold">2</Text>
            </View>
            <Text className="text-gray-700">Under Review (24-48 hrs)</Text>
          </View>

          {/* Step 3 - Upcoming */}
          <View className="flex-row items-center mb-4">
            <View className="w-6 h-6 bg-gray-300 rounded-full items-center justify-center mr-3">
              <Text className="text-white text-xs font-bold">3</Text>
            </View>
            <Text className="text-gray-700">Approval & Email Notification</Text>
          </View>

          {/* Step 4 - Upcoming */}
          <View className="flex-row items-center">
            <View className="w-6 h-6 bg-gray-300 rounded-full items-center justify-center mr-3">
              <Text className="text-white text-xs font-bold">4</Text>
            </View>
            <Text className="text-gray-700">Start Driving!</Text>
          </View>
        </View>

        {/* Done Button */}
        <TouchableOpacity
          onPress={handleDone}
          className="w-full bg-orange-600 rounded-full py-4 items-center"
        >
          <Text className="text-white text-lg font-semibold">Done</Text>
        </TouchableOpacity>

        {/* Additional Info */}
        <Text className="text-sm text-gray-500 text-center mt-6">
          You'll receive an email notification once your application has been reviewed.
        </Text>
      </View>
    </ScrollView>
  );
}
