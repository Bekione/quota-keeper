'use client';

import { useState } from 'react';
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
        }}
      >
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#dbfe01', margin: 0 }}>
          QuotaKeeper
        </h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={onImportExport}
            style={{
              padding: '8px 16px',
              backgroundColor: '#2a2a2a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#3a3a3a';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#2a2a2a';
            }}
          >
            Import/Export
          </button>
          <button
            onClick={() => setSettingsOpen(true)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#2a2a2a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#3a3a3a';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#2a2a2a';
            }}
          >
            Settings
          </button>
          <button
            onClick={logout}
            style={{
              padding: '8px 16px',
              backgroundColor: '#2a2a2a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#3a3a3a';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#2a2a2a';
            }}
          >
            Logout
          </button>
        </div>
      </header>
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
