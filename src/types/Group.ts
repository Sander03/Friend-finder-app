export interface Group {
  id: string;
  name: string;
  // Waar de groep is (festival, park, strand...); kan leeg zijn.
  eventName: string;
  joinCode: string;
  // Alleen de demo-groep heeft een vaste plek; gewone groepen werken overal.
  center: { lat: number; lng: number } | null;
  endsAt: string;
}

export interface GroupSummary extends Group {
  memberCount: number;
}

export interface Place {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export interface MemberLocation {
  lat: number;
  lng: number;
  accuracy: number | null;
  note: string;
  updatedAt: string;
}

export interface Member {
  id: string;
  userId: string | null;
  name: string;
  color: string;
  location: MemberLocation | null;
}
