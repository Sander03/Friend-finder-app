import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { distanceMeters, type LatLng } from '../lib/geo';
import { createGroup, getMembers, getMyGroups, getPlaces, joinGroup, leaveGroup } from '../services/groupService';
import type { Group, GroupSummary, Member, Place } from '../types/Group';

// Alleen voor de demo-groep: verder dan dit van het terrein? Dan tonen we een demo-positie.
const MAX_DISTANCE_FROM_DEMO_M = 3000;

// Onthoudt per gebruiker welke groep je laatst koos, zodat je kan wisselen tussen groepen.
const currentGroupKey = (userId: string) => `waarbenje.group.${userId}`;

async function readCurrentGroup(userId: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(currentGroupKey(userId));
  } catch {
    return null;
  }
}

async function saveCurrentGroup(userId: string, groupId: string): Promise<void> {
  try {
    await AsyncStorage.setItem(currentGroupKey(userId), groupId);
  } catch {
    // Niet erg: dan tonen we de groep waar je het laatst lid van werd.
  }
}

type RealPosition = LatLng & { accuracy: number | null };

export interface MyPosition extends LatLng {
  accuracy: number | null;
  isDemo: boolean;
}

interface GroupState {
  groups: GroupSummary[];
  group: Group | null;
  places: Place[];
  members: Member[];
  myMemberId: string | null;
  myPosition: MyPosition | null;
  realPosition: RealPosition | null;
  status: 'idle' | 'loading' | 'ready' | 'error';
  error: string | null;
  load: (userId: string) => Promise<void>;
  refreshMembers: () => Promise<void>;
  join: (code: string, userId: string) => Promise<void>;
  create: (name: string, place: string, userId: string) => Promise<void>;
  select: (groupId: string, userId: string) => Promise<void>;
  leave: (userId: string) => Promise<void>;
  setRealPosition: (position: RealPosition | null) => void;
  reset: () => void;
}

// Gewone groepen gebruiken altijd je echte locatie, waar je ook bent.
// De demo-groep heeft een vaste plek: ben je daar niet, dan zet de app je op het terrein.
function positionFor(group: Group | null, real: RealPosition | null): MyPosition | null {
  const demo = group?.center ?? null;
  if (demo === null) return real !== null ? { ...real, isDemo: false } : null;
  if (real !== null && distanceMeters(real, demo) <= MAX_DISTANCE_FROM_DEMO_M) return { ...real, isDemo: false };
  return { ...demo, accuracy: null, isDemo: true };
}

export const useGroupStore = create<GroupState>((set, get) => ({
  groups: [],
  group: null,
  places: [],
  members: [],
  myMemberId: null,
  myPosition: null,
  realPosition: null,
  status: 'idle',
  error: null,
  load: async (userId) => {
    set({ status: 'loading', error: null });
    try {
      const [groups, preferred] = await Promise.all([getMyGroups(userId), readCurrentGroup(userId)]);
      const group = groups.find((g) => g.id === preferred) ?? groups[0] ?? null;
      if (group === null) {
        set({ groups, group: null, places: [], members: [], myMemberId: null, myPosition: null, status: 'ready' });
        return;
      }
      const [places, members] = await Promise.all([getPlaces(group.id), getMembers(group.id)]);
      const me = members.find((m) => m.userId === userId) ?? null;
      set({
        groups,
        group,
        places,
        members,
        myMemberId: me?.id ?? null,
        myPosition: positionFor(group, get().realPosition),
        status: 'ready',
      });
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
    await saveCurrentGroup(userId, await joinGroup(code));
    await get().load(userId);
  },
  create: async (name, place, userId) => {
    await saveCurrentGroup(userId, await createGroup(name, place));
    await get().load(userId);
  },
  select: async (groupId, userId) => {
    if (get().group?.id === groupId) return;
    await saveCurrentGroup(userId, groupId);
    await get().load(userId);
  },
  leave: async (userId) => {
    const { myMemberId } = get();
    if (myMemberId === null) return;
    await leaveGroup(myMemberId);
    await AsyncStorage.removeItem(currentGroupKey(userId)).catch(() => {});
    await get().load(userId);
  },
  setRealPosition: (position) => {
    set({ realPosition: position, myPosition: positionFor(get().group, position) });
  },
  reset: () =>
    set({
      groups: [],
      group: null,
      places: [],
      members: [],
      myMemberId: null,
      myPosition: null,
      realPosition: null,
      status: 'idle',
    }),
}));
