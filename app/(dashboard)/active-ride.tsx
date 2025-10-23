import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Linking,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

const { width, height } = Dimensions.get('window');

interface RouteStep {
  instruction: string;
  distance: number;
  location: string;
}

export default function ActiveRideScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const mapRef = useRef<MapView>(null);

  // Parse booking data from route params
  const bookingData = params.booking ? JSON.parse(params.booking as string) : null;

  // Ride states: 'en_route_pickup' | 'at_pickup' | 'en_route_dropoff' | 'at_dropoff'
  const [rideStatus, setRideStatus] = useState<string>('en_route_pickup');
  const [currentLocation, setCurrentLocation] = useState({
    latitude: 37.78025,
    longitude: -122.4351,
  });
  const [eta, setEta] = useState('5 min');
  const [distanceRemaining, setDistanceRemaining] = useState('1.2 km');
  const [currentInstruction, setCurrentInstruction] = useState<RouteStep>({
    instruction: 'Turn left in 200m',
    distance: 200,
    location: 'Maple Avenue',
  });
  
  // Waiting time at pickup (counts up)
  const [waitingMinutes, setWaitingMinutes] = useState(0);
  const [waitingSeconds, setWaitingSeconds] = useState(0);

  // Route coordinates (example - in production these would come from navigation API)
  const [routeCoordinates, setRouteCoordinates] = useState([
    { latitude: 37.78025, longitude: -122.4351 },
    { latitude: 37.78225, longitude: -122.4331 },
    { latitude: 37.78425, longitude: -122.4311 },
    { latitude: 37.78625, longitude: -122.4291 },
    { latitude: 37.78825, longitude: -122.4271 },
  ]);

  // Pickup and dropoff locations
  const pickupLocation = {
    latitude: bookingData?.pickup_coordinates?.[0] || 37.78825,
    longitude: bookingData?.pickup_coordinates?.[1] || -122.4324,
  };

  const dropoffLocation = {
    latitude: bookingData?.dropoff_coordinates?.[0] || 37.79825,
    longitude: bookingData?.dropoff_coordinates?.[1] || -122.4224,
  };

  useEffect(() => {
    if (!bookingData) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Booking data not found',
        position: 'top',
      });
      router.back();
      return;
    }

    // In production: Start location tracking and route navigation
    // For now, we'll simulate with static data
    fitMapToRoute();
  }, []);

  // Waiting time timer - starts when driver arrives at pickup
  useEffect(() => {
    if (rideStatus === 'at_pickup') {
      const interval = setInterval(() => {
        setWaitingSeconds((prev) => {
          if (prev === 59) {
            setWaitingMinutes((m) => m + 1);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    } else {
      // Reset timer when leaving at_pickup state
      setWaitingMinutes(0);
      setWaitingSeconds(0);
    }
  }, [rideStatus]);

  const fitMapToRoute = () => {
    if (mapRef.current && routeCoordinates.length > 0) {
      mapRef.current.fitToCoordinates(
        [currentLocation, pickupLocation, dropoffLocation],
        {
          edgePadding: { top: 200, right: 50, bottom: 400, left: 50 },
          animated: true,
        }
      );
    }
  };

  const handleZoomIn = () => {
    // Zoom in functionality
    Toast.show({
      type: 'info',
      text1: 'Zoom In',
      position: 'top',
    });
  };

  const handleZoomOut = () => {
    // Zoom out functionality
    Toast.show({
      type: 'info',
      text1: 'Zoom Out',
      position: 'top',
    });
  };

  const handleRecenter = () => {
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      });
    }
  };

  const handleMessage = () => {
    // Open messaging - could integrate with SMS or in-app messaging
    const phoneNumber = bookingData?.passenger_phone || '';
    if (phoneNumber) {
      Linking.openURL(`sms:${phoneNumber}`);
    } else {
      Toast.show({
        type: 'info',
        text1: 'Message',
        text2: 'Opening message to passenger',
        position: 'top',
      });
    }
  };

  const handleCall = () => {
    // Make phone call
    const phoneNumber = bookingData?.passenger_phone || '';
    if (phoneNumber) {
      Linking.openURL(`tel:${phoneNumber}`);
    } else {
      Toast.show({
        type: 'info',
        text1: 'Call',
        text2: 'Calling passenger',
        position: 'top',
      });
    }
  };

  const handleArrived = () => {
    if (rideStatus === 'en_route_pickup') {
      // Driver arrived at pickup
      Alert.alert(
        'Arrived at Pickup',
        'Have you arrived at the pickup location?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Yes, I\'ve Arrived',
            onPress: () => {
              setRideStatus('at_pickup');
              Toast.show({
                type: 'success',
                text1: 'Arrived',
                text2: 'Passenger has been notified',
                position: 'top',
              });
              // In production: Update route to dropoff location
              // Update button to show "Start Ride"
            },
          },
        ]
      );
    } else if (rideStatus === 'at_pickup') {
      // Start the ride
      Alert.alert(
        'Start Ride',
        'Is the passenger in the vehicle?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Start Ride',
            onPress: () => {
              setRideStatus('en_route_dropoff');
              setCurrentInstruction({
                instruction: 'Head to destination',
                distance: 5000,
                location: bookingData?.dropoff_location || 'Destination',
              });
              Toast.show({
                type: 'success',
                text1: 'Ride Started',
                text2: 'Navigate to dropoff location',
                position: 'top',
              });
            },
          },
        ]
      );
    } else if (rideStatus === 'en_route_dropoff') {
      // Arrived at dropoff
      Alert.alert(
        'Complete Ride',
        'Have you arrived at the dropoff location?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Complete',
            onPress: () => {
              setRideStatus('at_dropoff');
              Toast.show({
                type: 'success',
                text1: 'Ride Completed',
                text2: 'Thank you for the ride!',
                position: 'top',
              });
              
              // Prepare ride completion data
              const rideCompletionData = {
                fare: bookingData.fare,
                tip: bookingData.tip || 1.50, // Default tip or from booking data
                payment_method: bookingData.payment_method || 'Cash Payment',
                passenger_name: bookingData.passenger_name,
                distance: bookingData.distance,
                duration: bookingData.estimated_duration || 22, // Use actual duration if tracked
                passenger_rating: bookingData.passenger_rating,
              };
              
              // Navigate to ride completed screen
              setTimeout(() => {
                router.push({
                  pathname: '/(dashboard)/ride-completed',
                  params: {
                    rideData: JSON.stringify(rideCompletionData),
                  },
                });
              }, 1000);
            },
          },
        ]
      );
    }
  };

  const handleCancelRide = () => {
    Alert.alert(
      'Cancel Ride',
      'Are you sure you want to cancel this ride? This action cannot be undone.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              // In production: Call API to cancel ride
              Toast.show({
                type: 'success',
                text1: 'Ride Cancelled',
                text2: 'Returning to dashboard',
                position: 'top',
              });
              setTimeout(() => {
                router.replace('/(dashboard)');
              }, 1500);
            } catch (error) {
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to cancel ride',
                position: 'top',
              });
            }
          },
        },
      ]
    );
  };

  // Determine route line style based on ride status
  const getRouteLineWidth = () => {
    return rideStatus === 'en_route_dropoff' ? 6 : 3;
  };

  const getRouteLineColor = () => {
    return rideStatus === 'en_route_dropoff' ? '#3B82F6' : '#60A5FA';
  };

  const getButtonText = () => {
    if (rideStatus === 'en_route_pickup') return "I've Arrived";
    if (rideStatus === 'at_pickup') return 'Start Ride';
    if (rideStatus === 'en_route_dropoff') return 'Complete Ride';
    return 'Done';
  };

  const getStatusText = () => {
    if (rideStatus === 'en_route_pickup') return 'Picking up';
    if (rideStatus === 'at_pickup') return 'Waiting for passenger';
    if (rideStatus === 'en_route_dropoff') return 'En route to dropoff';
    return 'Completed';
  };

  if (!bookingData) {
    return (
      <View className="flex-1 bg-gray-900 items-center justify-center">
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  return (
    <View className="flex-1">
      {/* Map View */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={{ width, height }}
        initialRegion={{
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
      >
        {/* Route Polyline */}
        <Polyline
          coordinates={routeCoordinates}
          strokeColor={getRouteLineColor()}
          strokeWidth={getRouteLineWidth()}
          lineDashPattern={rideStatus === 'en_route_pickup' ? [10, 10] : undefined}
        />

        {/* Pickup Marker */}
        {rideStatus !== 'en_route_dropoff' && (
          <Marker
            coordinate={pickupLocation}
            title="Pickup Location"
            pinColor="#3B82F6"
          />
        )}

        {/* Dropoff Marker */}
        <Marker
          coordinate={dropoffLocation}
          title="Dropoff Location"
          pinColor="#EF4444"
        />
      </MapView>

      {/* Navigation Instruction at Top */}
      {rideStatus !== 'at_pickup' && (
        <View className="absolute top-16 left-4 right-20">
          <View className="bg-gray-900 rounded-2xl p-4 flex-row items-center border border-gray-700">
            <View className="w-14 h-14 bg-orange-600 rounded-full items-center justify-center mr-4">
              <Text className="text-white text-2xl">↰</Text>
            </View>
            <View className="flex-1">
              <Text className="text-white text-xl font-bold">
                {currentInstruction.instruction}
              </Text>
              <Text className="text-gray-400 text-base mt-1">
                {currentInstruction.location}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Map Controls (Right Side) */}
      <View className="absolute top-16 right-4">
        {/* Location/Recenter Button */}
        <TouchableOpacity
          onPress={handleRecenter}
          className="w-12 h-12 bg-gray-900 rounded-full items-center justify-center mb-2 border border-gray-700"
        >
          <Text className="text-white text-xl">📍</Text>
        </TouchableOpacity>

        {/* Zoom Controls */}
        <View className="bg-gray-900 rounded-2xl border border-gray-700 overflow-hidden">
          <TouchableOpacity
            onPress={handleZoomIn}
            className="w-12 h-12 items-center justify-center border-b border-gray-700"
          >
            <Text className="text-white text-2xl font-bold">+</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleZoomOut}
            className="w-12 h-12 items-center justify-center"
          >
            <Text className="text-white text-2xl font-bold">−</Text>
          </TouchableOpacity>
        </View>

        {/* Compass Button */}
        <TouchableOpacity
          onPress={handleRecenter}
          className="w-12 h-12 bg-gray-900 rounded-full items-center justify-center mt-2 border border-gray-700"
        >
          <Text className="text-white text-xl">🧭</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Sheet */}
      <View className="absolute bottom-0 left-0 right-0">
        {/* Handle Bar */}
        <View className="items-center pt-2">
          <View className="w-12 h-1 bg-gray-600 rounded-full" />
        </View>

        {/* Content */}
        <View className="bg-gray-900 rounded-t-3xl px-6 pt-6 pb-8">
          {rideStatus === 'at_pickup' ? (
            /* You've Arrived Screen */
            <>
              {/* Title */}
              <View className="items-center mb-6">
                <Text className="text-white text-4xl font-bold">You've Arrived</Text>
              </View>

              {/* Waiting Time */}
              <View className="items-center mb-6">
                <Text className="text-gray-400 text-base mb-4">Waiting Time</Text>
                <View className="flex-row gap-4">
                  <View className="bg-gray-800 rounded-2xl px-8 py-6 items-center min-w-[140px]">
                    <Text className="text-white text-5xl font-bold mb-2">
                      {String(waitingMinutes).padStart(2, '0')}
                    </Text>
                    <Text className="text-gray-400 text-base">Minutes</Text>
                  </View>
                  <View className="bg-gray-800 rounded-2xl px-8 py-6 items-center min-w-[140px]">
                    <Text className="text-white text-5xl font-bold mb-2">
                      {String(waitingSeconds).padStart(2, '0')}
                    </Text>
                    <Text className="text-gray-400 text-base">Seconds</Text>
                  </View>
                </View>
              </View>

              {/* Divider */}
              <View className="h-px bg-gray-800 mb-6" />

              {/* Passenger Info */}
              <View className="flex-row items-center justify-between mb-6">
                <View className="flex-row items-center flex-1">
                  {/* Profile Image */}
                  <View className="w-16 h-16 bg-gray-700 rounded-full items-center justify-center mr-4">
                    <Text className="text-3xl">👤</Text>
                  </View>

                  {/* Name and Rating */}
                  <View className="flex-1">
                    <Text className="text-white text-2xl font-semibold mb-1">
                      {bookingData.passenger_name}
                    </Text>
                    <View className="flex-row items-center">
                      <Text className="text-yellow-500 text-lg mr-1">⭐</Text>
                      <Text className="text-white text-lg font-medium">
                        {bookingData.passenger_rating?.toFixed(1) || '4.9'} stars
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Message and Call Buttons */}
                <View className="flex-row gap-3">
                  <TouchableOpacity
                    onPress={handleMessage}
                    className="w-14 h-14 bg-gray-800 rounded-full items-center justify-center"
                  >
                    <Text className="text-white text-xl">🔕</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleCall}
                    className="w-14 h-14 bg-gray-800 rounded-full items-center justify-center"
                  >
                    <Text className="text-white text-xl">📞</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Divider */}
              <View className="h-px bg-gray-800 mb-6" />

              {/* Pickup Location */}
              <View className="mb-4">
                <View className="flex-row items-start">
                  <View className="w-8 h-8 items-center justify-center mr-3">
                    <Text className="text-red-500 text-xl">📍</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-400 text-sm mb-1">Picking up at:</Text>
                    <Text className="text-white text-lg font-medium">
                      {bookingData.pickup_location}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Destination Location */}
              <View className="mb-6">
                <View className="flex-row items-start">
                  <View className="w-8 h-8 items-center justify-center mr-3">
                    <Text className="text-blue-500 text-xl">📍</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-400 text-sm mb-1">Destination:</Text>
                    <Text className="text-white text-lg font-medium">
                      {bookingData.dropoff_location}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Start Ride Button */}
              <TouchableOpacity
                onPress={handleArrived}
                className="bg-orange-600 rounded-2xl py-5 items-center"
              >
                <Text className="text-white text-xl font-bold">Start Ride</Text>
              </TouchableOpacity>
            </>
          ) : (
            /* Normal Navigation Screen */
            <>
              {/* ETA Display */}
              <View className="items-center mb-6">
                <Text className="text-white text-5xl font-bold">{eta}</Text>
                <Text className="text-gray-400 text-base mt-2">
                  ETA • {distanceRemaining} away
                </Text>
              </View>

              {/* Divider */}
              <View className="h-px bg-gray-800 mb-6" />

              {/* Passenger Info */}
              <View className="flex-row items-center justify-between mb-6">
                <View className="flex-row items-center flex-1">
                  {/* Profile Image */}
                  <View className="w-16 h-16 bg-gray-700 rounded-full items-center justify-center mr-4">
                    <Text className="text-3xl">👤</Text>
                  </View>

                  {/* Name and Status */}
                  <View className="flex-1">
                    <Text className="text-gray-400 text-sm mb-1">{getStatusText()}</Text>
                    <Text className="text-white text-2xl font-semibold">
                      {bookingData.passenger_name}
                    </Text>
                    <View className="flex-row items-center mt-1">
                      <Text className="text-yellow-500 text-base mr-1">⭐</Text>
                      <Text className="text-white text-lg font-medium">
                        {bookingData.passenger_rating?.toFixed(1) || '4.9'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Message and Call Buttons */}
                <View className="flex-row gap-3">
                  <TouchableOpacity
                    onPress={handleMessage}
                    className="w-14 h-14 bg-blue-600 rounded-full items-center justify-center"
                  >
                    <Text className="text-white text-xl">💬</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleCall}
                    className="w-14 h-14 bg-blue-600 rounded-full items-center justify-center"
                  >
                    <Text className="text-white text-xl">📞</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Action Button */}
              <TouchableOpacity
                onPress={handleArrived}
                className="bg-orange-600 rounded-2xl py-5 items-center mb-3"
              >
                <Text className="text-white text-xl font-bold">{getButtonText()}</Text>
              </TouchableOpacity>

              {/* Cancel Ride Link */}
              <TouchableOpacity onPress={handleCancelRide} className="items-center py-2">
                <Text className="text-red-500 text-lg font-semibold">Cancel Ride</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <Toast />
    </View>
  );
}
