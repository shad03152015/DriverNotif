import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Dimensions,
  Animated,
  PanResponder,
  TouchableOpacity,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.35;

interface Booking {
  id: string;
  fare: number;
  distance: number;
  pickup_location: string;
  dropoff_location: string;
  passenger_name: string;
  passenger_rating?: number;
  expires_at: string;
  created_at: string;
  estimated_duration?: number;
}

interface BookingSliderViewProps {
  bookings: Booking[];
  onBookingPress: (booking: Booking) => void;
  onAccept: (booking: Booking) => void;
}

const BookingCard = ({
  booking,
  onPress,
  onSwipeLeft,
  onSwipeRight,
  isTopCard,
}: {
  booking: Booking;
  onPress: () => void;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  isTopCard: boolean;
}) => {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const position = useRef(new Animated.ValueXY()).current;

  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp',
  });

  useEffect(() => {
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
  }, [booking.expires_at]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => isTopCard,
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          // Swipe right - Accept
          Animated.spring(position, {
            toValue: { x: SCREEN_WIDTH + 100, y: gesture.dy },
            useNativeDriver: true,
          }).start(() => {
            onSwipeRight();
            position.setValue({ x: 0, y: 0 });
          });
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          // Swipe left - Decline
          Animated.spring(position, {
            toValue: { x: -SCREEN_WIDTH - 100, y: gesture.dy },
            useNativeDriver: true,
          }).start(() => {
            onSwipeLeft();
            position.setValue({ x: 0, y: 0 });
          });
        } else {
          // Return to center
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            friction: 4,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const cardStyle = {
    transform: [
      { translateX: position.x },
      { translateY: position.y },
      { rotate: rotate },
    ],
  };

  const handleAccept = () => {
    Animated.spring(position, {
      toValue: { x: SCREEN_WIDTH + 100, y: 0 },
      useNativeDriver: true,
    }).start(() => {
      onSwipeRight();
      position.setValue({ x: 0, y: 0 });
    });
  };

  const handleDecline = () => {
    Animated.spring(position, {
      toValue: { x: -SCREEN_WIDTH - 100, y: 0 },
      useNativeDriver: true,
    }).start(() => {
      onSwipeLeft();
      position.setValue({ x: 0, y: 0 });
    });
  };

  return (
    <Animated.View
      style={[
        cardStyle,
        {
          position: 'absolute',
          width: SCREEN_WIDTH - 32,
          bottom: 0,
          left: 16,
          zIndex: isTopCard ? 10 : 1,
        },
      ]}
      {...(isTopCard ? panResponder.panHandlers : {})}
    >
      <View className="bg-gray-900 rounded-3xl px-6 py-6 border border-gray-800">
        {/* Header: Name, Rating, Timer */}
        <View className="flex-row justify-between items-start mb-4">
          <View className="flex-row items-center flex-1">
            <Text className="text-white text-2xl font-semibold mr-2">
              {booking.passenger_name}
            </Text>
            <View className="flex-row items-center">
              <Text className="text-yellow-500 text-lg mr-1">⭐</Text>
              <Text className="text-white text-lg font-medium">
                {booking.passenger_rating?.toFixed(1) || '5.0'}
              </Text>
            </View>
          </View>

          {/* Timer */}
          <View className="items-end">
            <Text className="text-orange-500 text-3xl font-bold">
              {timeRemaining}s
            </Text>
          </View>
        </View>

        {/* Pickup Location */}
        <View className="flex-row items-center mb-3">
          <View className="w-4 h-4 rounded-full bg-blue-500 mr-3" />
          <Text className="text-gray-300 text-base flex-1" numberOfLines={1}>
            {booking.pickup_location}
          </Text>
        </View>

        {/* Dropoff Location */}
        <View className="flex-row items-center mb-5">
          <View className="w-5 h-5 items-center justify-center mr-3">
            <Text className="text-red-500 text-lg">📍</Text>
          </View>
          <Text className="text-gray-300 text-base flex-1" numberOfLines={1}>
            {booking.dropoff_location}
          </Text>
        </View>

        {/* Stats Row: FARE, DIST., DUR. */}
        <View className="flex-row justify-between mb-5">
          <View className="flex-1 items-center">
            <Text className="text-gray-500 text-xs mb-1">FARE</Text>
            <Text className="text-white text-xl font-bold">
              ${booking.fare.toFixed(2)}
            </Text>
          </View>
          <View className="flex-1 items-center">
            <Text className="text-gray-500 text-xs mb-1">DIST.</Text>
            <Text className="text-white text-xl font-bold">
              {booking.distance.toFixed(1)} km
            </Text>
          </View>
          <View className="flex-1 items-center">
            <Text className="text-gray-500 text-xs mb-1">DUR.</Text>
            <Text className="text-white text-xl font-bold">
              {booking.estimated_duration || 15} min
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={handleAccept}
            className="flex-1 bg-orange-600 rounded-2xl py-4 items-center"
            disabled={!isTopCard}
          >
            <Text className="text-white text-lg font-bold">Accept</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDecline}
            className="flex-1 bg-transparent border-2 border-gray-700 rounded-2xl py-4 items-center"
            disabled={!isTopCard}
          >
            <Text className="text-gray-400 text-lg font-semibold">Decline</Text>
          </TouchableOpacity>
        </View>

        {/* Progress Bar */}
        <View className="mt-4">
          <View className="h-1 bg-gray-800 rounded-full overflow-hidden">
            <View
              className="h-full bg-orange-500 rounded-full"
              style={{ width: `${(timeRemaining / 30) * 100}%` }}
            />
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

export default function BookingSliderView({
  bookings,
  onBookingPress,
  onAccept,
}: BookingSliderViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSwipeLeft = () => {
    // Decline booking - just move to next
    setCurrentIndex((prev) => prev + 1);
  };

  const handleSwipeRight = () => {
    // Accept booking
    if (bookings[currentIndex]) {
      onAccept(bookings[currentIndex]);
      setCurrentIndex((prev) => prev + 1);
    }
  };

  if (bookings.length === 0) {
    return null;
  }

  return (
    <View style={{ height: 400, position: 'relative' }}>
      {bookings
        .slice(currentIndex, currentIndex + 2)
        .reverse()
        .map((booking, index) => (
          <BookingCard
            key={booking.id}
            booking={booking}
            onPress={() => onBookingPress(booking)}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
            isTopCard={index === 1}
          />
        ))}

      {currentIndex >= bookings.length && (
        <View className="absolute bottom-0 left-4 right-4 bg-gray-900 rounded-3xl p-8 items-center border border-gray-800">
          <Text className="text-gray-400 text-lg mb-2">All caught up!</Text>
          <Text className="text-gray-500 text-center">
            No more booking requests at the moment
          </Text>
        </View>
      )}
    </View>
  );
}
