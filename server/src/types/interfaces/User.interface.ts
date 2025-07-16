export interface User {
  username: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'superadmin';
}
