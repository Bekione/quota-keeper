'use client';

import { CheckCircle, Clock } from 'lucide-react';
import { Account, PROVIDER_COLORS, AccountProvider } from '@/types/account';
import { useCountdown, formatCountdown } from '@/hooks/useCountdown';

interface HeroCardProps {
  accounts: Account[];
}

export default function HeroCard({ accounts }: HeroCardProps) {
  // Find best available account or next to unlock
  const availableAccounts = accounts.filter((acc) => acc.status === 'AVAILABLE');
  const nextUnlock = accounts
    .filter((acc) => acc.status === 'LOCKED' && acc.unlock_at)
    .sort(
      (a, b) =>
        new Date(a.unlock_at!).getTime() - new Date(b.unlock_at!).getTime(),
    )[0];

  const primaryAccount = availableAccounts[0] || nextUnlock;
  const countdown = useCountdown(primaryAccount?.unlock_at);

  const providerColor = primaryAccount?.provider
    ? PROVIDER_COLORS[primaryAccount.provider as AccountProvider] || '#a1a1aa'
    : null;

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
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', margin: '0 0 4px 0' }}>
                  <h2 style={{ fontSize: '32px', fontWeight: 700, margin: 0 }}>
                    {primaryAccount.name}
                  </h2>
                  {primaryAccount.provider && (
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '3px 10px',
                        borderRadius: '99px',
                        backgroundColor: `${providerColor}18`,
                        color: providerColor || '#a1a1aa',
                        border: `1px solid ${providerColor}40`,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {primaryAccount.provider}
                    </span>
                  )}
                </div>
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
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle size={14} /> Ready to use
                  </span>
                </div>
              </>
            ) : (
              <>
                <p style={{ color: '#a1a1aa', fontSize: '14px', margin: '0 0 8px 0' }}>
                  Next Available Account
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', margin: '0 0 4px 0' }}>
                  <h2 style={{ fontSize: '32px', fontWeight: 700, margin: 0 }}>
                    {primaryAccount.name}
                  </h2>
                  {primaryAccount.provider && (
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '3px 10px',
                        borderRadius: '99px',
                        backgroundColor: `${providerColor}18`,
                        color: providerColor || '#a1a1aa',
                        border: `1px solid ${providerColor}40`,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {primaryAccount.provider}
                    </span>
                  )}
                </div>
                <p style={{ color: '#a1a1aa', fontSize: '14px', margin: '0 0 16px 0' }}>
                  {primaryAccount.email}
                </p>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    flexWrap: 'wrap',
                  }}
                >
                  <div
                    style={{
                      display: 'inline-block',
                      padding: '8px 16px',
                      backgroundColor: 'rgba(250, 204, 21, 0.1)',
                      border: '1px solid rgba(250, 204, 21, 0.3)',
                      borderRadius: '6px',
                      color: '#facc15',
                      fontSize: '14px',
                      fontWeight: 500,
                    }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={14} /> Available in {formatCountdown(countdown)}
                    </span>
                  </div>
                  {primaryAccount.unlock_at && (
                    <span style={{ fontSize: '13px', color: '#a1a1aa' }}>
                      {new Date(primaryAccount.unlock_at).toLocaleString()}
                    </span>
                  )}
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
