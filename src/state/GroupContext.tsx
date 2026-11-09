import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useMemo, useRef, useState, type PropsWithChildren } from 'react';
import type { LatLng } from '../lib/geo';
import { createGroup, getMembers, getMyGroups, getPlaces, joinGroup, leaveGroup } from '../services/groupService';
import type { Group, GroupSummary, Member, Place } from '../types/Group';

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

export interface MyPosition extends LatLng {
  accuracy: number | null;
  isDemo: boolean;
}

interface GroupData {
  groups: GroupSummary[];
  group: Group | null;
  places: Place[];
  members: Member[];
  myMemberId: string | null;
  myPosition: MyPosition | null;
  status: 'idle' | 'loading' | 'ready' | 'error';
  error: string | null;
}

interface GroupContextValue extends GroupData {
  load: (userId: string) => Promise<void>;
  refreshMembers: () => Promise<void>;
  join: (code: string, userId: string) => Promise<void>;
  create: (name: string, place: string, userId: string) => Promise<void>;
  select: (groupId: string, userId: string) => Promise<void>;
  leave: (userId: string) => Promise<void>;
  reset: () => void;
}

const initial: GroupData = {
  groups: [],
  group: null,
  places: [],
  members: [],
  myMemberId: null,
  myPosition: null,
  status: 'idle',
  error: null,
};

// Deze versie gebruikt nog geen GPS (geen native features in de PWA-opdracht).
// In een groep met een vaste plek (de demo-groep) zetten we je op het terrein;
// in andere groepen is er nog geen positie. Echte locatie volgt in een volgende fase.
function positionFor(group: Group | null): MyPosition | null {
  const demo = group?.center ?? null;
  return demo !== null ? { ...demo, accuracy: null, isDemo: true } : null;
}

const GroupContext = createContext<GroupContextValue | null>(null);

// Je groepen, de leden van de actieve groep en je eigen positie.
export function GroupProvider({ children }: PropsWithChildren) {
  const [data, setData] = useState<GroupData>(initial);
  // De acties hieronder lezen altijd de nieuwste gegevens via deze ref,
  // ook als ze aangeroepen worden na een await.
  const current = useRef<GroupData>(initial);

  const set = useCallback((changes: Partial<GroupData>) => {
    current.current = { ...current.current, ...changes };
    setData(current.current);
  }, []);

  const load = useCallback(
    async (userId: string) => {
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
          myPosition: positionFor(group),
          status: 'ready',
        });
      } catch (error) {
        set({ status: 'error', error: error instanceof Error ? error.message : 'Er ging iets mis' });
      }
    },
    [set],
  );

  const refreshMembers = useCallback(async () => {
    const { group } = current.current;
    if (group === null) return;
    try {
      set({ members: await getMembers(group.id) });
    } catch {
      // De vorige gegevens blijven zichtbaar; de volgende update probeert opnieuw.
    }
  }, [set]);

  const join = useCallback(
    async (code: string, userId: string) => {
      await saveCurrentGroup(userId, await joinGroup(code));
      await load(userId);
    },
    [load],
  );

  const create = useCallback(
    async (name: string, place: string, userId: string) => {
      await saveCurrentGroup(userId, await createGroup(name, place));
      await load(userId);
    },
    [load],
  );

  const select = useCallback(
    async (groupId: string, userId: string) => {
      if (current.current.group?.id === groupId) return;
      await saveCurrentGroup(userId, groupId);
      await load(userId);
    },
    [load],
  );

  const leave = useCallback(
    async (userId: string) => {
      const { myMemberId } = current.current;
      if (myMemberId === null) return;
      await leaveGroup(myMemberId);
      await AsyncStorage.removeItem(currentGroupKey(userId)).catch(() => {});
      await load(userId);
    },
    [load],
  );

  const reset = useCallback(() => set(initial), [set]);

  const value = useMemo(
    () => ({ ...data, load, refreshMembers, join, create, select, leave, reset }),
    [data, load, refreshMembers, join, create, select, leave, reset],
  );

  return <GroupContext.Provider value={value}>{children}</GroupContext.Provider>;
}

export function useGroups(): GroupContextValue {
  const context = useContext(GroupContext);
  if (context === null) throw new Error('useGroups moet binnen een GroupProvider gebruikt worden');
  return context;
}
