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
  expires_at: string;
  created_at: string;
}

interface BookingSliderViewProps {
  bookings: Booking[];
  onBookingPress: (booking: Booking) => void;
  onAccept: (bookingId: string) => void;
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
    // Calculate time remaining
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
          // Swipe left - Ignore
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

  const totalTime = 30;
  const progressPercentage = (timeRemaining / totalTime) * 100;

  return (
    <Animated.View
      style={[
        cardStyle,
        {
          position: 'absolute',
          width: SCREEN_WIDTH - 48,
          zIndex: isTopCard ? 10 : 1,
        },
      ]}
      {...(isTopCard ? panResponder.panHandlers : {})}
    >
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.9}
        disabled={!isTopCard}
        className="bg-gray-800 rounded-3xl p-6 border-2 border-gray-700"
      >
        {/* Timer and Distance */}
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-gray-400 text-sm mb-1">
              FARE • {booking.distance.toFixed(1)} km
            </Text>
            <Text className="text-white text-4xl font-bold">
              ${booking.fare.toFixed(2)}
            </Text>
          </View>

          <View className="items-end">
            <Text className="text-orange-500 text-3xl font-bold mb-2">
              {timeRemaining}s
            </Text>
            <View className="w-28 h-3 bg-gray-700 rounded-full overflow-hidden">
              <View
                className="h-full bg-orange-500 rounded-full"
                style={{ width: `${progressPercentage}%` }}
              />
            </View>
          </View>
        </View>

        {/* Locations */}
        <View className="bg-gray-700 rounded-2xl p-4 mb-6">
          <View className="flex-row items-start mb-3">
            <Text className="text-green-500 text-xl mr-3">📍</Text>
            <View className="flex-1">
              <Text className="text-gray-400 text-xs mb-1">PICKUP</Text>
              <Text className="text-white text-base font-medium" numberOfLines={2}>
                {booking.pickup_location}
              </Text>
            </View>
          </View>

          <View className="h-px bg-gray-600 my-3" />

          <View className="flex-row items-start">
            <Text className="text-red-500 text-xl mr-3">🎯</Text>
            <View className="flex-1">
              <Text className="text-gray-400 text-xs mb-1">DROPOFF</Text>
              <Text className="text-white text-base font-medium" numberOfLines={2}>
                {booking.dropoff_location}
              </Text>
            </View>
          </View>
        </View>

        {/* Passenger */}
        <View className="flex-row items-center">
          <View className="w-12 h-12 bg-gray-600 rounded-full items-center justify-center mr-3">
            <Text className="text-2xl">👤</Text>
          </View>
          <View className="flex-1">
            <Text className="text-gray-400 text-xs">PASSENGER</Text>
            <Text className="text-white text-base font-semibold">
              {booking.passenger_name}
            </Text>
          </View>
        </View>

        {/* Swipe Instructions */}
        {isTopCard && (
          <View className="flex-row justify-between mt-6 pt-6 border-t border-gray-700">
            <View className="flex-row items-center">
              <Text className="text-2xl mr-2">👈</Text>
              <Text className="text-gray-400 text-sm">Swipe to ignore</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-gray-400 text-sm">Swipe to accept</Text>
              <Text className="text-2xl ml-2">👉</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>

      {/* Swipe Indicators */}
      {isTopCard && (
        <>
          <Animated.View
            style={{
              position: 'absolute',
              top: 50,
              left: 20,
              opacity: position.x.interpolate({
                inputRange: [-SCREEN_WIDTH / 2, -50, 0],
                outputRange: [1, 0.5, 0],
                extrapolate: 'clamp',
              }),
            }}
          >
            <View className="bg-red-500 px-6 py-3 rounded-2xl transform -rotate-12">
              <Text className="text-white text-2xl font-bold">IGNORE</Text>
            </View>
          </Animated.View>

          <Animated.View
            style={{
              position: 'absolute',
              top: 50,
              right: 20,
              opacity: position.x.interpolate({
                inputRange: [0, 50, SCREEN_WIDTH / 2],
                outputRange: [0, 0.5, 1],
                extrapolate: 'clamp',
              }),
            }}
          >
            <View className="bg-green-500 px-6 py-3 rounded-2xl transform rotate-12">
              <Text className="text-white text-2xl font-bold">ACCEPT</Text>
            </View>
          </Animated.View>
        </>
      )}
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
    // Ignore booking - just move to next
    setCurrentIndex((prev) => prev + 1);
  };

  const handleSwipeRight = () => {
    // Accept booking
    if (bookings[currentIndex]) {
      onAccept(bookings[currentIndex].id);
      setCurrentIndex((prev) => prev + 1);
    }
  };

  if (bookings.length === 0) {
    return null;
  }

  return (
    <View style={{ height: 450 }} className="items-center justify-center">
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
        <View className="absolute bg-gray-800 rounded-3xl p-8 items-center">
          <Text className="text-gray-400 text-lg mb-2">All caught up!</Text>
          <Text className="text-gray-500 text-center">
            No more booking requests at the moment
          </Text>
        </View>
      )}
    </View>
  );
}
