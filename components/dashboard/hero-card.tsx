'use client';

import { Account } from '@/types/account';
import { useCountdown, formatCountdown } from '@/hooks/useCountdown';

interface HeroCardProps {
  accounts: Account[];
}

export default function HeroCard({ accounts }: HeroCardProps) {
  // Find best available account or next to unlock
  const availableAccounts = accounts.filter((acc) => acc.status === 'AVAILABLE');
  const nextUnlock = accounts
    .filter((acc) => acc.status === 'LOCKED' && acc.unlock_at)
    .sort((a, b) => (a.unlock_at?.getTime() ?? 0) - (b.unlock_at?.getTime() ?? 0))[0];

  const primaryAccount = availableAccounts[0] || nextUnlock;
  const countdown = useCountdown(primaryAccount?.unlock_at);

  return (
    <div
      style={{
        backgroundColor: '#171717',
        border: '1px solid #2a2a2a',
        borderRadius: '16px',
        padding: '32px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background accent */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '400px',
          height: '400px',
          backgroundColor: 'rgba(219, 254, 1, 0.05)',
          borderRadius: '50%',
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {primaryAccount ? (
          <>
            {primaryAccount.status === 'AVAILABLE' ? (
              <>
                <p style={{ color: '#a1a1aa', fontSize: '14px', margin: '0 0 8px 0' }}>
                  Best Available Account
                </p>
                <h2 style={{ fontSize: '32px', fontWeight: 700, margin: '0 0 4px 0' }}>
                  {primaryAccount.name}
                </h2>
                <p style={{ color: '#a1a1aa', fontSize: '14px', margin: '0 0 16px 0' }}>
                  {primaryAccount.email}
                </p>
                <div
                  style={{
                    display: 'inline-block',
                    padding: '8px 16px',
                    backgroundColor: 'rgba(134, 239, 172, 0.1)',
                    border: '1px solid rgba(134, 239, 172, 0.3)',
                    borderRadius: '6px',
                    color: '#86efac',
                    fontSize: '14px',
                    fontWeight: 500,
                  }}
                >
                  ✓ Ready to use
                </div>
              </>
            ) : (
              <>
                <p style={{ color: '#a1a1aa', fontSize: '14px', margin: '0 0 8px 0' }}>
                  Next Available Account
                </p>
                <h2 style={{ fontSize: '32px', fontWeight: 700, margin: '0 0 4px 0' }}>
                  {primaryAccount.name}
                </h2>
                <p style={{ color: '#a1a1aa', fontSize: '14px', margin: '0 0 16px 0' }}>
                  {primaryAccount.email}
                </p>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <div
                    style={{
                      display: 'inline-block',
                      padding: '8px 16px',
                      backgroundColor: 'rgba(250, 204, 21, 0.1)',
                      border: '1px solid rgba(250, 204, 21, 0.3)',
                      borderRadius: '6px',
                      color: '#faco15',
                      fontSize: '14px',
                      fontWeight: 500,
                    }}
                  >
                    ⏱ {formatCountdown(countdown)}
                  </div>
                </div>
              </>
            )}
          </>
        ) : (
          <>
            <p style={{ color: '#a1a1aa', fontSize: '14px', margin: '0 0 8px 0' }}>
              No Accounts
            </p>
            <h2 style={{ fontSize: '32px', fontWeight: 700, margin: '0 0 4px 0', color: '#71717a' }}>
              No accounts available
            </h2>
            <p style={{ color: '#a1a1aa', fontSize: '14px', margin: '0' }}>
              Add an account to get started
            </p>
          </>
        )}
      </div>
    </div>
  );
}
