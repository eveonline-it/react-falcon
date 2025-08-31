// React 19 JSX Transform - no explicit React import needed
import { useState, useMemo } from 'react';
import { Container, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

import {
  useGroups,
  useGroupsHealth,
  useGroupMembers,
  useCharacterSearch,
  useGroupMemberCounts,
  useCreateGroup,
  useUpdateGroup,
  useDeleteGroup,
  useAddGroupMember,
  useRemoveGroupMember
} from 'hooks/useGroups';

const GroupsAdmin = () => {
  const [filters, setFilters] = useState({
    type: '',
    page: 1,
    limit: 20
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [characterSearchTerm, setCharacterSearchTerm] = useState('');

  // All hooks
  const { data: groupsData, isLoading, error } = useGroups(filters);
  const { data: healthData } = useGroupsHealth();
  const { data: selectedGroupMembers } = useGroupMembers(selectedGroup?.id);
  const { data: characterSearchResults } = useCharacterSearch(characterSearchTerm);
  
  const createMutation = useCreateGroup();
  const updateMutation = useUpdateGroup();
  const deleteMutation = useDeleteGroup();
  const addMemberMutation = useAddGroupMember();
  const removeMemberMutation = useRemoveGroupMember();

  const groups = groupsData?.groups || [];

  const displayedGroups = useMemo(() => {
    if (!searchTerm) return groups;
    
    return groups.filter(group => 
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [groups, searchTerm]);

  // Get member counts for all displayed groups
  const displayedGroupIds = useMemo(() => {
    return displayedGroups.map(group => group.id);
  }, [displayedGroups]);
  const { data: memberCounts, isLoading: memberCountsLoading } = useGroupMemberCounts(displayedGroupIds);

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">
          <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
          Failed to load groups: {error.message}
        </Alert>
      </Container>
    );
  }

  return (
    <Container>
      <h1>Groups Admin - Cleaned imports</h1>
      <p>Groups found: {groups.length}</p>
      <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
      <p>Error: {error ? error.message : 'None'}</p>
      <p>Member counts loading: {memberCountsLoading ? 'Yes' : 'No'}</p>
    </Container>
  );
};

export default GroupsAdmin;