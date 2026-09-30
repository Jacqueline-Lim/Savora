export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  photoUrl: string | null;
}

export interface AuthSession {
  user: AuthUser;
}
