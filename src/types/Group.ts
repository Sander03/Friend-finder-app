export interface Group {
  id: string;
  name: string;
  eventName: string;
  joinCode: string;
  center: { lat: number; lng: number };
  endsAt: string;
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
