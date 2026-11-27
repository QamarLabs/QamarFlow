export type User = {
  id: string;
  email: string;
  username?: string;
  fullName: string;
  avatarUrl?: string | null;
};

export type AuthResponse = { accessToken: string; user?: User };

export type Credentials = { email: string; password: string };
export type RegisterInput = Credentials & { fullName: string };
