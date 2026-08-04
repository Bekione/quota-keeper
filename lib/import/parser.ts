export interface ParsedAccount {
  name: string;
  email: string;
  unlock_at?: Date;
}

export function parseQuotaKeeperFormat(text: string): ParsedAccount[] {
  const accounts: ParsedAccount[] = [];
  const lines = text.split('\n').map((line) => line.trim()).filter((line) => line.length > 0);

  let i = 0;
  while (i < lines.length) {
    const name = lines[i];
    const email = lines[i + 1];

    if (!name || !email || !email.includes('@')) {
      i++;
      continue;
    }

    const account: ParsedAccount = { name, email };

    // Look for "can use @" or "available @" line
    if (i + 2 < lines.length) {
      const nextLine = lines[i + 2];
      if (nextLine.toLowerCase().includes('can use @') || nextLine.toLowerCase().includes('available @')) {
        const dateStr = nextLine.split('@')[1]?.trim();
        if (dateStr) {
          try {
            // Try to parse the date - format: "2/9/2026, 8:57:36 AM"
            const unlockDate = new Date(dateStr);
            if (!isNaN(unlockDate.getTime())) {
              account.unlock_at = unlockDate;
            }
          } catch (e) {
            // Ignore parsing errors
          }
        }
        i += 3;
      } else {
        i += 2;
      }
    } else {
      i += 2;
    }

    accounts.push(account);
  }

  return accounts;
}

export function parseCSVFormat(text: string): ParsedAccount[] {
  const lines = text.split('\n').map((line) => line.trim()).filter((line) => line.length > 0);
  const accounts: ParsedAccount[] = [];

  // Skip header if present
  let startIdx = 0;
  if (lines[0]?.toLowerCase().includes('name') || lines[0]?.toLowerCase().includes('email')) {
    startIdx = 1;
  }

  for (let i = startIdx; i < lines.length; i++) {
    const parts = lines[i].split(',');
    if (parts.length < 2) continue;

    const name = parts[0]?.trim();
    const email = parts[1]?.trim();

    if (!name || !email) continue;

    const account: ParsedAccount = { name, email };

    if (parts.length > 2 && parts[2]?.trim()) {
      try {
        const unlockDate = new Date(parts[2].trim());
        if (!isNaN(unlockDate.getTime())) {
          account.unlock_at = unlockDate;
        }
      } catch (e) {
        // Ignore
      }
    }

    accounts.push(account);
  }

  return accounts;
}

export function parseImport(text: string): ParsedAccount[] {
  // Try to detect format - CSV has commas, QuotaKeeper format doesn't
  if (text.includes(',') && text.includes('@')) {
    return parseCSVFormat(text);
  }
  return parseQuotaKeeperFormat(text);
}
