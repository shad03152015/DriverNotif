import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Toast from 'react-native-toast-message';

export default function RideCompletedScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Parse ride data from route params
  const rideData = params.rideData ? JSON.parse(params.rideData as string) : null;

  if (!rideData) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text className="text-gray-900 text-lg">No ride data found</Text>
      </View>
    );
  }

  const totalFare = rideData.fare || 0;
  const tip = rideData.tip || 0;
  const paymentMethod = rideData.payment_method || 'Cash Payment';
  const passengerName = rideData.passenger_name || 'Passenger';
  const distance = rideData.distance || 0;
  const duration = rideData.duration || rideData.estimated_duration || 0;

  const handleCollectPayment = () => {
    Toast.show({
      type: 'success',
      text1: 'Payment Collected',
      text2: `$${totalFare.toFixed(2)} received`,
      position: 'top',
    });

    // Navigate back to dashboard after a short delay
    setTimeout(() => {
      router.replace('/(dashboard)');
    }, 1500);
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Handle Bar */}
        <View className="items-center pt-4 pb-2">
          <View className="w-12 h-1 bg-gray-300 rounded-full" />
        </View>

        {/* Title */}
        <View className="items-center mb-8 mt-6">
          <Text className="text-gray-900 text-4xl font-bold">Ride Completed!</Text>
        </View>

        {/* Total Fare */}
        <View className="items-center mb-8">
          <Text className="text-gray-500 text-base mb-2 tracking-widest">TOTAL FARE</Text>
          <Text className="text-gray-900 text-6xl font-bold">${totalFare.toFixed(2)}</Text>
        </View>

        {/* Divider */}
        <View className="h-px bg-gray-200 mx-6 mb-6" />

        {/* Payment Method */}
        <View className="flex-row items-center px-6 mb-6">
          <View className="w-12 h-12 bg-gray-100 rounded-xl items-center justify-center mr-4">
            <Text className="text-2xl">💵</Text>
          </View>
          <Text className="text-gray-900 text-xl font-medium">{paymentMethod}</Text>
        </View>

        {/* Divider */}
        <View className="h-px bg-gray-200 mx-6 mb-6" />

        {/* Passenger Info */}
        <View className="px-6 mb-6">
          <View className="flex-row items-center">
            {/* Profile Image */}
            <View className="w-16 h-16 bg-gray-300 rounded-full items-center justify-center mr-4">
              <Text className="text-3xl">👤</Text>
            </View>

            {/* Name and Trip Details */}
            <View className="flex-1">
              <Text className="text-gray-900 text-2xl font-semibold mb-1">
                {passengerName}
              </Text>
              <Text className="text-gray-500 text-base">
                {distance.toFixed(1)}km • {duration} min
              </Text>
            </View>
          </View>
        </View>

        {/* Bonus Earned */}
        {tip > 0 && (
          <View className="mx-6 mb-6">
            <View className="bg-green-500 rounded-2xl px-6 py-5 flex-row items-center justify-center">
              <Text className="text-white text-2xl mr-3">🏆</Text>
              <Text className="text-white text-2xl font-bold">
                BONUS EARNED! +${tip.toFixed(2)}
              </Text>
            </View>
          </View>
        )}

        {/* Collect Payment Button */}
        <View className="px-6 mb-8">
          <TouchableOpacity
            onPress={handleCollectPayment}
            className="bg-orange-600 rounded-2xl py-5 items-center"
            activeOpacity={0.8}
          >
            <Text className="text-white text-2xl font-bold tracking-wide">
              COLLECT PAYMENT
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Toast />
    </View>
  );
}
