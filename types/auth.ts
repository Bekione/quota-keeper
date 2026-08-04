export interface AuthSession {
  authenticated: boolean;
  lastLogin?: Date;
}

export interface LoginInput {
  password: string;
}
