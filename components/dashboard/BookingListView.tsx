import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';

interface Booking {
  id: string;
  fare: number;
  distance: number;
  pickup_location: string;
  dropoff_location: string;
  passenger_name: string;
  expires_at: string;
  created_at: string;
}

interface BookingListViewProps {
  bookings: Booking[];
  onBookingPress: (booking: Booking) => void;
}

const BookingListItem = ({ booking, onPress }: { booking: Booking; onPress: () => void }) => {
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    // Calculate initial time remaining
    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const expiresAt = new Date(booking.expires_at).getTime();
      const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
      setTimeRemaining(remaining);
    };

    calculateTimeRemaining();

    // Update every second
    const interval = setInterval(() => {
      calculateTimeRemaining();
    }, 1000);

    return () => clearInterval(interval);
  }, [booking.expires_at]);

  // Calculate progress percentage (assuming 30 seconds total)
  const totalTime = 30;
  const progressPercentage = (timeRemaining / totalTime) * 100;

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-gray-800 rounded-2xl p-5 mb-4"
      activeOpacity={0.7}
    >
      <View className="flex-row justify-between items-start mb-4">
        <View className="flex-1">
          <Text className="text-gray-400 text-sm mb-1">
            FARE • {booking.distance.toFixed(1)} km
          </Text>
          <Text className="text-white text-3xl font-bold">
            ${booking.fare.toFixed(2)}
          </Text>
        </View>

        <View className="items-end">
          <Text className="text-orange-500 text-2xl font-bold mb-1">
            {timeRemaining}s
          </Text>
          <View className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
            <View
              className="h-full bg-orange-500 rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </View>
        </View>
      </View>

      {/* Pickup and Dropoff Info */}
      <View className="space-y-2">
        <View className="flex-row items-start">
          <Text className="text-green-500 text-lg mr-2">📍</Text>
          <Text className="text-gray-300 text-sm flex-1" numberOfLines={1}>
            {booking.pickup_location}
          </Text>
        </View>
        <View className="flex-row items-start">
          <Text className="text-red-500 text-lg mr-2">🎯</Text>
          <Text className="text-gray-300 text-sm flex-1" numberOfLines={1}>
            {booking.dropoff_location}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function BookingListView({ bookings, onBookingPress }: BookingListViewProps) {
  return (
    <FlatList
      data={bookings}
      renderItem={({ item }) => (
        <BookingListItem booking={item} onPress={() => onBookingPress(item)} />
      )}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      scrollEnabled={false}
    />
  );
}
