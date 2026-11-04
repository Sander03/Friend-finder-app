import { useEffect, useRef, useState } from 'react';
import { distanceMeters } from '../lib/geo';
import { watchPosition } from '../lib/location';
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

    return watchPosition(
      (position) => {
        setPermission('granted');
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
      () => {
        setPermission('denied');
        setRealPosition(null);
      },
    );
  }, [group, enabled, myMemberId, setRealPosition]);

  return permission;
}
