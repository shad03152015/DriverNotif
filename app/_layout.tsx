import { Stack } from 'expo-router';
import '../global.css';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#ffffff' },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)/login" />
      <Stack.Screen name="(auth)/forgot-password" />
      <Stack.Screen name="(auth)/registration" />
      <Stack.Screen name="(auth)/review" />
      <Stack.Screen name="(auth)/success" />
    </Stack>
  );
}
