export type AccountStatus = "AVAILABLE" | "LOCKED";

export type AccountProvider =
  | "Antigravity"
  | "Google AI Studio"
  | "ChatGPT"
  | "Claude"
  | "Cursor"
  | "Other";

export const PROVIDERS: AccountProvider[] = [
  "Antigravity",
  "Google AI Studio",
  "ChatGPT",
  "Claude",
  "Cursor",
  "Other",
];

export const PROVIDER_COLORS: Record<AccountProvider, string> = {
  Antigravity: "#dbfe01",
  "Google AI Studio": "#4285f4",
  ChatGPT: "#10a37f",
  Claude: "#d4a574",
  Cursor: "#00d4ff",
  Other: "#a1a1aa",
};

export interface Account {
  id: string;
  name: string;
  email: string;
  chrome_profile?: string;
  provider?: AccountProvider;
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
  provider?: AccountProvider;
  notes?: string;
}

export interface LockAccountInput {
  unlock_at: Date;
}
