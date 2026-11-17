'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Settings as SettingsIcon, LogOut, ArrowUpDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import SettingsModal from '@/components/modals/settings-modal';

export interface HeaderProps {
  onImportExport?: () => void;
}

export default function Header({ onImportExport }: HeaderProps) {
  const { logout } = useAuth();
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <header
        style={{
          borderBottom: '1px solid #2a2a2a',
          backgroundColor: '#0d0d0d',
          padding: '16px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Image
            src="/favicon-32x32.png"
            width={26}
            height={26}
            alt="QuotaKeeper Logo"
            style={{ borderRadius: '6px' }}
          />
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#dbfe01', margin: 0, letterSpacing: '-0.02em' }}>
            QuotaKeeper
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={onImportExport}
            style={{
              padding: '8px 14px',
              backgroundColor: '#171717',
              color: '#ffffff',
              border: '1px solid #2a2a2a',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#222222';
              e.currentTarget.style.borderColor = '#3a3a3a';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#171717';
              e.currentTarget.style.borderColor = '#2a2a2a';
            }}
          >
            <ArrowUpDown size={14} style={{ color: '#a1a1aa' }} />
            <span>Import/Export</span>
          </button>
          <button
            onClick={() => setSettingsOpen(true)}
            style={{
              padding: '8px 14px',
              backgroundColor: '#171717',
              color: '#ffffff',
              border: '1px solid #2a2a2a',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#222222';
              e.currentTarget.style.borderColor = '#3a3a3a';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#171717';
              e.currentTarget.style.borderColor = '#2a2a2a';
            }}
          >
            <SettingsIcon size={14} style={{ color: '#a1a1aa' }} />
            <span>Settings</span>
          </button>
          <button
            onClick={logout}
            style={{
              padding: '8px 14px',
              backgroundColor: '#171717',
              color: '#fca5a5',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#171717';
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.25)';
            }}
          >
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>
      </header>
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
