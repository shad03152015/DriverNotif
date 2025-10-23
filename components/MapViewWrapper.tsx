import React from 'react';
import { Platform, View, Text } from 'react-native';

// Conditionally import MapView only on native platforms
let MapView: any = null;
let Marker: any = null;
let Polyline: any = null;
let PROVIDER_GOOGLE: any = null;

if (Platform.OS !== 'web') {
  const maps = require('react-native-maps');
  MapView = maps.default;
  Marker = maps.Marker;
  Polyline = maps.Polyline;
  PROVIDER_GOOGLE = maps.PROVIDER_GOOGLE;
}

// Web fallback component
const WebMapPlaceholder = ({ style, children }: any) => (
  <View style={[style, { backgroundColor: '#e5e7eb', justifyContent: 'center', alignItems: 'center' }]}>
    <Text style={{ color: '#6b7280', fontSize: 16 }}>
      Map view not available on web.{'\n'}
      Please run on Android or iOS.
    </Text>
    {children}
  </View>
);

// Export wrapped components
export const PlatformMapView = Platform.OS === 'web' ? WebMapPlaceholder : MapView;
export const PlatformMarker = Platform.OS === 'web' ? View : Marker;
export const PlatformPolyline = Platform.OS === 'web' ? View : Polyline;
export const MAP_PROVIDER_GOOGLE = PROVIDER_GOOGLE;
