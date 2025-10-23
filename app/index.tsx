import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to registration screen
    router.replace('/(auth)/registration');
  }, []);

  return null;
}
