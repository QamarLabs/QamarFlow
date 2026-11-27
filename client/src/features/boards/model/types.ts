export type Board = {
  id: string;
  name: string;
  ownerId: string;
  backgroundImage?: string | null;
  createdAt?: string;
  updatedAt?: string;
  role?: 'owner' | 'member';
  /** Present on GET /boards/:id (BoardDetail). */
  members?: BoardMember[];
};

export type BoardMember = {
  userId: string;
  username: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  role: 'owner' | 'member';
  joinedAt: string;
};

export type BoardPatch = Partial<Pick<Board, 'name' | 'backgroundImage'>>;
