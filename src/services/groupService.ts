import { supabase } from '../lib/supabase';
import type { Group, Member, Place } from '../types/Group';

interface GroupRow {
  id: string;
  name: string;
  event_name: string;
  join_code: string;
  center_lat: number;
  center_lng: number;
  ends_at: string;
}

interface MemberRow {
  id: string;
  user_id: string | null;
  display_name: string;
  color: string;
}

interface LocationRow {
  member_id: string;
  lat: number;
  lng: number;
  accuracy: number | null;
  note: string;
  updated_at: string;
}

const toGroup = (row: GroupRow): Group => ({
  id: row.id,
  name: row.name,
  eventName: row.event_name,
  joinCode: row.join_code,
  center: { lat: row.center_lat, lng: row.center_lng },
  endsAt: row.ends_at,
});

// De groep waar de gebruiker het laatst lid van werd.
export async function getMyGroup(userId: string): Promise<Group | null> {
  const { data, error } = await supabase
    .from('group_members')
    .select('joined_at, groups (id, name, event_name, join_code, center_lat, center_lng, ends_at)')
    .eq('user_id', userId)
    .order('joined_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error !== null) throw new Error(error.message);
  const group = data?.groups as unknown as GroupRow | null | undefined;
  return group ? toGroup(group) : null;
}

export async function getPlaces(groupId: string): Promise<Place[]> {
  const { data, error } = await supabase.from('places').select('id, name, lat, lng').eq('group_id', groupId);
  if (error !== null) throw new Error(error.message);
  return data;
}

export async function getMembers(groupId: string): Promise<Member[]> {
  const [members, locations] = await Promise.all([
    supabase.from('group_members').select('id, user_id, display_name, color').eq('group_id', groupId).order('joined_at'),
    supabase
      .from('group_locations')
      .select('member_id, lat, lng, accuracy, note, updated_at')
      .eq('group_id', groupId),
  ]);
  if (members.error !== null) throw new Error(members.error.message);
  if (locations.error !== null) throw new Error(locations.error.message);

  const byMember = new Map((locations.data as LocationRow[]).map((row) => [row.member_id, row]));
  return (members.data as MemberRow[]).map((row) => {
    const loc = byMember.get(row.id);
    return {
      id: row.id,
      userId: row.user_id,
      name: row.display_name,
      color: row.color,
      location: loc
        ? { lat: loc.lat, lng: loc.lng, accuracy: loc.accuracy, note: loc.note, updatedAt: loc.updated_at }
        : null,
    };
  });
}

export async function joinGroup(code: string): Promise<void> {
  const { error } = await supabase.rpc('join_group', { p_code: code });
  if (error !== null) throw new Error(error.message);
}

export async function shareLocation(
  member: { id: string; groupId: string },
  position: { lat: number; lng: number; accuracy: number | null },
  note?: string,
): Promise<void> {
  const row: Record<string, unknown> = {
    member_id: member.id,
    group_id: member.groupId,
    lat: position.lat,
    lng: position.lng,
    accuracy: position.accuracy,
    updated_at: new Date().toISOString(),
  };
  if (note !== undefined) row.note = note;
  const { error } = await supabase.from('locations').upsert(row);
  if (error !== null) throw new Error(error.message);
}

export async function stopSharing(memberId: string): Promise<void> {
  const { error } = await supabase.from('locations').delete().eq('member_id', memberId);
  if (error !== null) throw new Error(error.message);
}

// Roept onChange op telkens als een locatie of lid in de groep verandert.
export function subscribeToGroup(groupId: string, onChange: () => void): () => void {
  const channel = supabase
    .channel(`group:${groupId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'locations', filter: `group_id=eq.${groupId}` }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'group_members', filter: `group_id=eq.${groupId}` }, onChange)
    .subscribe();
  return () => {
    void supabase.removeChannel(channel);
  };
}
