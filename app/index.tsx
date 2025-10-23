import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      
      if (token) {
        // User is logged in, navigate to main app
        // TODO: Add token validation and navigate to dashboard
        router.replace('/(auth)/login');
      } else {
        // User not logged in, go to login screen
        router.replace('/(auth)/login');
      }
    } catch (error) {
      // Error checking auth, go to login
      router.replace('/(auth)/login');
    } finally {
      setIsChecking(false);
    }
  };

  if (isChecking) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#FF4500" />
      </View>
    );
  }

  return null;
}
