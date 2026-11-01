import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import { distanceMeters } from '../lib/geo';
import { shareLocation, subscribeToGroup } from '../services/groupService';
import { useGroupStore } from '../state/useGroupStore';

const UPLOAD_EVERY_MS = 15_000;
const UPLOAD_AFTER_METERS = 10;

export type PermissionState = 'unknown' | 'granted' | 'denied';

// Volgt je positie, deelt die met de groep en houdt de vriendenlijst live bij.
export function useLocationSharing(enabled: boolean): PermissionState {
  const group = useGroupStore((s) => s.group);
  const myMemberId = useGroupStore((s) => s.myMemberId);
  const setRealPosition = useGroupStore((s) => s.setRealPosition);
  const refreshMembers = useGroupStore((s) => s.refreshMembers);
  const [permission, setPermission] = useState<PermissionState>('unknown');
  const lastUpload = useRef<{ at: number; lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (group === null) return;
    return subscribeToGroup(group.id, () => void refreshMembers());
  }, [group, refreshMembers]);

  useEffect(() => {
    if (group === null || !enabled) return;
    let subscription: Location.LocationSubscription | null = null;
    let cancelled = false;

    (async () => {
      const { granted } = await Location.requestForegroundPermissionsAsync();
      if (cancelled) return;
      setPermission(granted ? 'granted' : 'denied');
      if (!granted) {
        setRealPosition(null);
        return;
      }
      subscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, distanceInterval: 5 },
        (loc) => {
          const position = { lat: loc.coords.latitude, lng: loc.coords.longitude, accuracy: loc.coords.accuracy };
          setRealPosition(position);
          const mine = useGroupStore.getState().myPosition;
          if (myMemberId === null || mine === null || mine.isDemo) return;

          const last = lastUpload.current;
          const now = Date.now();
          if (last !== null && now - last.at < UPLOAD_EVERY_MS && distanceMeters(last, position) < UPLOAD_AFTER_METERS) {
            return;
          }
          lastUpload.current = { at: now, lat: position.lat, lng: position.lng };
          shareLocation({ id: myMemberId, groupId: group.id }, position).catch(() => {
            lastUpload.current = null;
          });
        },
      );
      if (cancelled) subscription.remove();
    })().catch(() => {
      setPermission('denied');
      setRealPosition(null);
    });

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, [group, enabled, myMemberId, setRealPosition]);

  return permission;
}
