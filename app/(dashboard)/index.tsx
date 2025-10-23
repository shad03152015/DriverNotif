import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { getDashboardData, updateOnlineStatus, getBookingRequests } from '../../services/api';
import BookingListView from '../../components/dashboard/BookingListView';
import BookingSliderView from '../../components/dashboard/BookingSliderView';
import BookingDetailModal from '../../components/dashboard/BookingDetailModal';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'slider'>('list');
  const [dashboardData, setDashboardData] = useState({
    todayEarnings: 0,
    tripsCompleted: 0,
  });
  const [bookingRequests, setBookingRequests] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  useEffect(() => {
    if (isOnline) {
      // Poll for booking requests every 5 seconds when online
      const interval = setInterval(() => {
        fetchBookingRequests();
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [isOnline]);

  const checkAuthAndLoadData = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        router.replace('/(auth)/login');
        return;
      }

      await loadDashboardData();
    } catch (error) {
      console.error('Auth check error:', error);
      router.replace('/(auth)/login');
    }
  };

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const data = await getDashboardData();
      setDashboardData({
        todayEarnings: data.today_earnings || 0,
        tripsCompleted: data.trips_completed || 0,
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load dashboard data',
        position: 'top',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBookingRequests = async () => {
    try {
      const requests = await getBookingRequests();
      setBookingRequests(requests || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const handleToggleOnline = async () => {
    try {
      const newStatus = !isOnline;
      await updateOnlineStatus(newStatus);
      setIsOnline(newStatus);

      Toast.show({
        type: 'success',
        text1: newStatus ? 'You are now Online' : 'You are now Offline',
        text2: newStatus ? 'You can receive booking requests' : 'You will not receive new bookings',
        position: 'top',
      });

      if (newStatus) {
        // Fetch booking requests immediately when going online
        await fetchBookingRequests();
      } else {
        // Clear booking requests when going offline
        setBookingRequests([]);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update online status',
        position: 'top',
      });
    }
  };

  const handleBookingPress = (booking: any) => {
    setSelectedBooking(booking);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedBooking(null);
  };

  const handleAcceptBooking = async (bookingId: string) => {
    // Will be implemented with accept booking logic
    setIsModalVisible(false);
    setSelectedBooking(null);
  };

  const handleProfilePress = () => {
    // Navigate to profile screen (to be implemented)
    Toast.show({
      type: 'info',
      text1: 'Profile',
      text2: 'Profile screen coming soon',
      position: 'top',
    });
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-900 items-center justify-center">
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-900">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 pt-16 pb-6">
          <View className="flex-row items-center justify-between mb-6">
            {/* Profile Icon */}
            <TouchableOpacity
              onPress={handleProfilePress}
              className="w-14 h-14 bg-gray-800 rounded-full items-center justify-center"
            >
              <Text className="text-2xl">👤</Text>
            </TouchableOpacity>

            {/* Online/Offline Toggle */}
            <TouchableOpacity
              onPress={handleToggleOnline}
              className={`flex-row items-center px-6 py-3 rounded-full ${
                isOnline ? 'bg-green-500' : 'bg-gray-600'
              }`}
            >
              <View className="w-8 h-8 bg-white rounded-full items-center justify-center mr-3">
                <Text className="text-xl">🛵</Text>
              </View>
              <Text className="text-white text-lg font-semibold">
                {isOnline ? 'Online' : 'Offline'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* View Mode Toggle */}
          <View className="flex-row bg-gray-800 rounded-2xl p-1 mb-6">
            <TouchableOpacity
              onPress={() => setViewMode('list')}
              className={`flex-1 py-3 rounded-xl ${
                viewMode === 'list' ? 'bg-orange-600' : 'bg-transparent'
              }`}
            >
              <Text
                className={`text-center font-semibold ${
                  viewMode === 'list' ? 'text-white' : 'text-gray-400'
                }`}
              >
                📋 List View
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setViewMode('slider')}
              className={`flex-1 py-3 rounded-xl ${
                viewMode === 'slider' ? 'bg-orange-600' : 'bg-transparent'
              }`}
            >
              <Text
                className={`text-center font-semibold ${
                  viewMode === 'slider' ? 'text-white' : 'text-gray-400'
                }`}
              >
                🎴 Swipe View
              </Text>
            </TouchableOpacity>
          </View>

          {/* Earnings and Trips */}
          <View className="flex-row gap-4 mb-6">
            {/* Today's Earnings */}
            <View className="flex-1 bg-gray-800 rounded-3xl p-6">
              <Text className="text-gray-400 text-sm mb-2">Today's Earnings</Text>
              <Text className="text-white text-3xl font-bold">
                ${dashboardData.todayEarnings.toFixed(2)}
              </Text>
            </View>

            {/* Trips Completed */}
            <View className="flex-1 bg-gray-800 rounded-3xl p-6">
              <Text className="text-gray-400 text-sm mb-2">Trips Completed</Text>
              <Text className="text-white text-3xl font-bold">
                {dashboardData.tripsCompleted}
              </Text>
            </View>
          </View>
        </View>

        {/* Booking Requests */}
        <View className="px-6 pb-6">
          {!isOnline ? (
            <View className="bg-gray-800 rounded-2xl p-8 items-center">
              <Text className="text-gray-400 text-lg mb-2">You are offline</Text>
              <Text className="text-gray-500 text-center">
                Toggle the switch to go online and receive booking requests
              </Text>
            </View>
          ) : bookingRequests.length === 0 ? (
            <View className="bg-gray-800 rounded-2xl p-8 items-center">
              <Text className="text-gray-400 text-lg mb-2">No bookings available</Text>
              <Text className="text-gray-500 text-center">
                Waiting for nearby ride requests...
              </Text>
            </View>
          ) : viewMode === 'list' ? (
            <BookingListView
              bookings={bookingRequests}
              onBookingPress={handleBookingPress}
            />
          ) : (
            <BookingSliderView
              bookings={bookingRequests}
              onBookingPress={handleBookingPress}
              onAccept={handleAcceptBooking}
            />
          )}
        </View>
      </ScrollView>

      {/* Booking Detail Modal */}
      <BookingDetailModal
        visible={isModalVisible}
        booking={selectedBooking}
        onClose={handleCloseModal}
        onAccept={handleAcceptBooking}
      />

      <Toast />
    </View>
  );
}
