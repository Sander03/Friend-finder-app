import { useEffect } from 'react';
import { subscribeToGroup } from '../services/groupService';
import { useGroups } from '../state/GroupContext';

export function useGroupUpdates(): void {
  const { group, refreshMembers } = useGroups();

  useEffect(() => {
    if (group === null) return;
    return subscribeToGroup(group.id, () => void refreshMembers());
  }, [group, refreshMembers]);
}
