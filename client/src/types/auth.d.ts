export type Roles = 'USER' | 'ADMIN' | 'SUPERADMIN';

export interface AccessTokenPayload {
  id: string;
  role: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  username: string;
  password: string;
  role: Roles;
}
