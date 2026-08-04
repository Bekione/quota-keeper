export type AccountStatus = 'AVAILABLE' | 'LOCKED';

export interface Account {
  id: string;
  name: string;
  email: string;
  chrome_profile?: string;
  status: AccountStatus;
  locked_at?: Date;
  unlock_at?: Date;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface AccountInput {
  name: string;
  email: string;
  chrome_profile?: string;
  notes?: string;
}

export interface LockAccountInput {
  unlock_at: Date;
}
