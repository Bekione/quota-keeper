'use client';

import { Account } from '@/types/account';
import AccountCard from './account-card';

interface AccountsListProps {
  accounts: Account[];
  onEdit?: (account: Account) => void;
  onDelete?: (account: Account) => void;
  onLock?: (account: Account) => void;
}

export default function AccountsList({ 
  accounts,
  onEdit,
  onDelete,
  onLock,
}: AccountsListProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '16px',
      }}
    >
      {accounts.map((account) => (
        <AccountCard
          key={account.id}
          account={account}
          onEdit={() => onEdit?.(account)}
          onDelete={() => onDelete?.(account)}
          onLock={() => onLock?.(account)}
        />
      ))}
    </div>
  );
}
