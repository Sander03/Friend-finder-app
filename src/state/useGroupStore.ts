import { create } from 'zustand';
import { distanceMeters, type LatLng } from '../lib/geo';
import { getMembers, getMyGroup, getPlaces, joinGroup } from '../services/groupService';
import type { Group, Member, Place } from '../types/Group';

// Verder dan dit van het terrein? Dan tonen we een demo-positie in plaats van je echte locatie.
const MAX_DISTANCE_FROM_EVENT_M = 3000;

export interface MyPosition extends LatLng {
  accuracy: number | null;
  isDemo: boolean;
}

interface GroupState {
  group: Group | null;
  places: Place[];
  members: Member[];
  myMemberId: string | null;
  myPosition: MyPosition | null;
  status: 'idle' | 'loading' | 'ready' | 'error';
  error: string | null;
  load: (userId: string) => Promise<void>;
  refreshMembers: () => Promise<void>;
  join: (code: string, userId: string) => Promise<void>;
  setRealPosition: (position: (LatLng & { accuracy: number | null }) | null) => void;
  reset: () => void;
}

export const useGroupStore = create<GroupState>((set, get) => ({
  group: null,
  places: [],
  members: [],
  myMemberId: null,
  myPosition: null,
  status: 'idle',
  error: null,
  load: async (userId) => {
    set({ status: 'loading', error: null });
    try {
      const group = await getMyGroup(userId);
      if (group === null) {
        set({ group: null, places: [], members: [], myMemberId: null, status: 'ready' });
        return;
      }
      const [places, members] = await Promise.all([getPlaces(group.id), getMembers(group.id)]);
      const me = members.find((m) => m.userId === userId) ?? null;
      set({ group, places, members, myMemberId: me?.id ?? null, status: 'ready' });
      if (get().myPosition === null) get().setRealPosition(null);
    } catch (error) {
      set({ status: 'error', error: error instanceof Error ? error.message : 'Er ging iets mis' });
    }
  },
  refreshMembers: async () => {
    const { group } = get();
    if (group === null) return;
    try {
      set({ members: await getMembers(group.id) });
    } catch {
      // De vorige gegevens blijven zichtbaar; de volgende update probeert opnieuw.
    }
  },
  join: async (code, userId) => {
    await joinGroup(code);
    await get().load(userId);
  },
  setRealPosition: (position) => {
    const { group } = get();
    if (position !== null && (group === null || distanceMeters(position, group.center) <= MAX_DISTANCE_FROM_EVENT_M)) {
      set({ myPosition: { ...position, isDemo: false } });
    } else if (group !== null) {
      // Niet op het evenement (of geen locatie): een vaste plek op het terrein.
      set({ myPosition: { lat: group.center.lat, lng: group.center.lng, accuracy: null, isDemo: true } });
    }
  },
  reset: () => set({ group: null, places: [], members: [], myMemberId: null, myPosition: null, status: 'idle' }),
}));
