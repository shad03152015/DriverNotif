import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface Booking {
  id: string;
  fare: number;
  distance: number;
  pickup_location: string;
  dropoff_location: string;
  passenger_name: string;
  passenger_phone?: string;
  passenger_rating?: number;
  expires_at: string;
  created_at: string;
  estimated_duration?: number;
}

interface BookingDetailModalProps {
  visible: boolean;
  booking: Booking | null;
  onClose: () => void;
  onAccept: (bookingId: string) => void;
}

export default function BookingDetailModal({
  visible,
  booking,
  onClose,
  onAccept,
}: BookingDetailModalProps) {
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    if (!booking) return;

    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const expiresAt = new Date(booking.expires_at).getTime();
      const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
      setTimeRemaining(remaining);
    };

    calculateTimeRemaining();
    const interval = setInterval(() => {
      calculateTimeRemaining();
    }, 1000);

    return () => clearInterval(interval);
  }, [booking?.expires_at]);

  const handleAccept = () => {
    if (booking) {
      onAccept(booking.id);
    }
  };

  if (!booking) return null;

  const totalTime = 30;
  const progressPercentage = (timeRemaining / totalTime) * 100;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/70 justify-end">
        <View className="bg-gray-900 rounded-t-3xl max-h-[85%]">
          {/* Header with Timer */}
          <View className="bg-orange-600 rounded-t-3xl px-6 py-8">
            <View className="flex-row justify-between items-center mb-4">
              <View>
                <Text className="text-white/80 text-sm mb-1">NEW BOOKING REQUEST</Text>
                <Text className="text-white text-4xl font-bold">
                  ${booking.fare.toFixed(2)}
                </Text>
                <Text className="text-white/80 text-base mt-1">
                  {booking.distance.toFixed(1)} km • {booking.estimated_duration || 15} min
                </Text>
              </View>

              <View className="items-center">
                <Text className="text-white text-5xl font-bold mb-2">
                  {timeRemaining}
                </Text>
                <Text className="text-white/80 text-sm">seconds</Text>
                <View className="w-20 h-2 bg-white/30 rounded-full overflow-hidden mt-2">
                  <View
                    className="h-full bg-white rounded-full"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </View>
              </View>
            </View>
          </View>

          <ScrollView className="px-6 pt-6" showsVerticalScrollIndicator={false}>
            {/* Passenger Info */}
            <View className="bg-gray-800 rounded-2xl p-5 mb-4">
              <Text className="text-gray-400 text-xs mb-3">PASSENGER</Text>
              <View className="flex-row items-center">
                <View className="w-16 h-16 bg-gray-700 rounded-full items-center justify-center mr-4">
                  <Text className="text-3xl">👤</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-white text-xl font-semibold mb-1">
                    {booking.passenger_name}
                  </Text>
                  {booking.passenger_rating && (
                    <View className="flex-row items-center">
                      <Text className="text-yellow-500 text-lg mr-1">⭐</Text>
                      <Text className="text-gray-300 text-base">
                        {booking.passenger_rating.toFixed(1)}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* Locations */}
            <View className="bg-gray-800 rounded-2xl p-5 mb-4">
              <View className="mb-4">
                <View className="flex-row items-start mb-2">
                  <View className="w-8 h-8 bg-green-500/20 rounded-full items-center justify-center mr-3">
                    <Text className="text-green-500 text-lg">📍</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-400 text-xs mb-1">PICKUP LOCATION</Text>
                    <Text className="text-white text-base font-medium leading-5">
                      {booking.pickup_location}
                    </Text>
                  </View>
                </View>
              </View>

              <View className="flex-row items-center my-3">
                <View className="w-8 items-center">
                  <View className="w-px h-6 bg-gray-600" />
                </View>
                <Text className="text-gray-500 text-sm ml-3">
                  {booking.distance.toFixed(1)} km • ~{booking.estimated_duration || 15} min
                </Text>
              </View>

              <View>
                <View className="flex-row items-start">
                  <View className="w-8 h-8 bg-red-500/20 rounded-full items-center justify-center mr-3">
                    <Text className="text-red-500 text-lg">🎯</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-400 text-xs mb-1">DROPOFF LOCATION</Text>
                    <Text className="text-white text-base font-medium leading-5">
                      {booking.dropoff_location}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Earnings Breakdown */}
            <View className="bg-gray-800 rounded-2xl p-5 mb-4">
              <Text className="text-gray-400 text-xs mb-4">EARNINGS BREAKDOWN</Text>

              <View className="flex-row justify-between mb-3">
                <Text className="text-gray-300 text-base">Base fare</Text>
                <Text className="text-white text-base font-semibold">
                  ${(booking.fare * 0.6).toFixed(2)}
                </Text>
              </View>

              <View className="flex-row justify-between mb-3">
                <Text className="text-gray-300 text-base">Distance charge</Text>
                <Text className="text-white text-base font-semibold">
                  ${(booking.fare * 0.4).toFixed(2)}
                </Text>
              </View>

              <View className="h-px bg-gray-700 my-2" />

              <View className="flex-row justify-between">
                <Text className="text-white text-lg font-semibold">Total earnings</Text>
                <Text className="text-green-500 text-lg font-bold">
                  ${booking.fare.toFixed(2)}
                </Text>
              </View>
            </View>

            {/* Buttons */}
            <View className="flex-row gap-3 mb-8">
              <TouchableOpacity
                onPress={onClose}
                className="flex-1 bg-gray-800 rounded-2xl py-5 items-center border border-gray-700"
              >
                <Text className="text-gray-300 text-lg font-semibold">Close</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleAccept}
                className="flex-1 bg-green-500 rounded-2xl py-5 items-center"
              >
                <Text className="text-white text-lg font-bold">Accept Ride</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
