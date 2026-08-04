'use client';

import { Account } from '@/types/account';

interface StatsRowProps {
  accounts: Account[];
}

export default function StatsRow({ accounts }: StatsRowProps) {
  const totalCount = accounts.length;
  const availableCount = accounts.filter((acc) => acc.status === 'AVAILABLE').length;
  const lockedCount = accounts.filter((acc) => acc.status === 'LOCKED').length;
  
  const nextUnlock = accounts
    .filter((acc) => acc.status === 'LOCKED' && acc.unlock_at)
    .sort((a, b) => (a.unlock_at?.getTime() ?? 0) - (b.unlock_at?.getTime() ?? 0))[0];

  const nextUnlockTime = nextUnlock?.unlock_at
    ? new Date(nextUnlock.unlock_at).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'N/A';

  const stats = [
    {
      label: 'Total Accounts',
      value: totalCount,
      accent: '#dbfe01',
    },
    {
      label: 'Available',
      value: availableCount,
      accent: '#86efac',
    },
    {
      label: 'Locked',
      value: lockedCount,
      accent: '#fca5a5',
    },
    {
      label: 'Next Unlock',
      value: nextUnlockTime,
      accent: '#93c5fd',
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
      }}
    >
      {stats.map((stat, idx) => (
        <div
          key={idx}
          style={{
            backgroundColor: '#171717',
            border: '1px solid #2a2a2a',
            borderRadius: '12px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <p
            style={{
              color: '#a1a1aa',
              fontSize: '12px',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              margin: 0,
            }}
          >
            {stat.label}
          </p>
          <p
            style={{
              fontSize: '28px',
              fontWeight: 700,
              margin: 0,
              color: stat.accent,
            }}
          >
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}
