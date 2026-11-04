import * as Location from 'expo-location';
import { Platform } from 'react-native';

export interface Position {
  lat: number;
  lng: number;
  accuracy: number | null;
}

// Volgt je positie. Roept onDenied op als je geen toegang geeft; geeft een functie terug om te stoppen.
// Op het web gebruiken we de Geolocation-API van de browser rechtstreeks: expo-location 18 crasht
// daar bij het stoppen ("removeSubscription is not a function").
export function watchPosition(onPosition: (position: Position) => void, onDenied: () => void): () => void {
  if (Platform.OS === 'web') {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      onDenied();
      return () => {};
    }
    const id = navigator.geolocation.watchPosition(
      (pos) => onPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy }),
      (error) => {
        if (error.code === error.PERMISSION_DENIED) onDenied();
      },
      { enableHighAccuracy: true, maximumAge: 5_000 },
    );
    return () => navigator.geolocation.clearWatch(id);
  }

  let subscription: Location.LocationSubscription | null = null;
  let stopped = false;
  (async () => {
    const { granted } = await Location.requestForegroundPermissionsAsync();
    if (stopped) return;
    if (!granted) {
      onDenied();
      return;
    }
    const sub = await Location.watchPositionAsync({ accuracy: Location.Accuracy.High, distanceInterval: 5 }, (loc) =>
      onPosition({ lat: loc.coords.latitude, lng: loc.coords.longitude, accuracy: loc.coords.accuracy }),
    );
    if (stopped) sub.remove();
    else subscription = sub;
  })().catch(onDenied);

  return () => {
    stopped = true;
    subscription?.remove();
  };
}
