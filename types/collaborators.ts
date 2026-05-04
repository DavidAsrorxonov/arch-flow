export interface CollaboratorListItem {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

export interface CollaboratorListResponse {
  collaborators: CollaboratorListItem[];
  canManageAccess: boolean;
}
