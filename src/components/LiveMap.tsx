import type { LatLng } from '../lib/geo';
import type { Member, Place } from '../types/Group';
import { Radar } from './Radar';

export interface LiveMapProps {
  me: LatLng & { accuracy: number | null };
  members: Member[];
  places: Place[];
  onSelectMember: (member: Member) => void;
}

export function LiveMap(props: LiveMapProps) {
  return <Radar {...props} />;
}
