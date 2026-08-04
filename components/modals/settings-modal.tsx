'use client';

import { useState, useEffect } from 'react';

const SETTINGS_KEY = 'quotakeeper_settings';

export interface Settings {
  defaultLockDuration: number;
  autoUnlockEnabled: boolean;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChange?: (settings: Settings) => void;
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>({
    defaultLockDuration: 7,
    autoUnlockEnabled: true,
  });

  useEffect(() => {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      try {
        setSettings(JSON.parse(stored));
      } catch (e) {
        // Use defaults
      }
    }
  }, []);

  const updateSettings = (newSettings: Partial<Settings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  };

  return { settings, updateSettings };
}

export default function SettingsModal({
  isOpen,
  onClose,
  onSettingsChange,
}: SettingsModalProps) {
  const { settings, updateSettings } = useSettings();
  const [localDuration, setLocalDuration] = useState(settings.defaultLockDuration);
  const [autoUnlock, setAutoUnlock] = useState(settings.autoUnlockEnabled);

  useEffect(() => {
    setLocalDuration(settings.defaultLockDuration);
    setAutoUnlock(settings.autoUnlockEnabled);
  }, [settings, isOpen]);

  if (!isOpen) return null;

  function handleSave() {
    updateSettings({
      defaultLockDuration: localDuration,
      autoUnlockEnabled: autoUnlock,
    });
    onSettingsChange?.({
      defaultLockDuration: localDuration,
      autoUnlockEnabled: autoUnlock,
    });
    onClose();
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#171717',
          border: '1px solid #2a2a2a',
          borderRadius: '12px',
          padding: '32px',
          maxWidth: '500px',
          width: '90%',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          style={{
            fontSize: '24px',
            fontWeight: 700,
            marginBottom: '24px',
            color: '#dbfe01',
          }}
        >
          Settings
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Default Lock Duration */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>
              Default Lock Duration
            </label>
            <p style={{ color: '#a1a1aa', fontSize: '12px', marginBottom: '12px', margin: '0 0 12px 0' }}>
              When you lock an account, it will be locked for this many days by default.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {[1, 3, 7].map((days) => (
                <button
                  key={days}
                  onClick={() => setLocalDuration(days)}
                  style={{
                    padding: '10px 8px',
                    backgroundColor: localDuration === days ? '#dbfe01' : '#2a2a2a',
                    color: localDuration === days ? '#000000' : '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  {days}d
                </button>
              ))}
            </div>
            <div
              style={{
                marginTop: '12px',
                padding: '8px 12px',
                backgroundColor: '#0d0d0d',
                borderRadius: '6px',
                fontSize: '12px',
                color: '#a1a1aa',
              }}
            >
              Currently: <strong>{localDuration} days</strong>
            </div>
          </div>

          {/* Auto-Unlock */}
          <div style={{ borderTop: '1px solid #2a2a2a', paddingTop: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <input
                type="checkbox"
                id="autoUnlock"
                checked={autoUnlock}
                onChange={(e) => setAutoUnlock(e.target.checked)}
                style={{ marginTop: '4px', cursor: 'pointer' }}
              />
              <div style={{ flex: 1 }}>
                <label htmlFor="autoUnlock" style={{ display: 'block', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                  Enable Auto-Unlock
                </label>
                <p style={{ color: '#a1a1aa', fontSize: '12px', margin: '8px 0 0 0' }}>
                  When enabled, accounts automatically become available when their unlock time is reached. The background sync service checks every 5 seconds.
                </p>
              </div>
            </div>
          </div>

          {/* Info */}
          <div
            style={{
              padding: '12px',
              backgroundColor: 'rgba(93, 210, 255, 0.1)',
              border: '1px solid rgba(93, 210, 255, 0.3)',
              borderRadius: '6px',
              fontSize: '12px',
              color: '#93c5fd',
            }}
          >
            All settings are stored locally on your device and synced with Supabase when changes are made.
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: '10px 16px',
                backgroundColor: '#2a2a2a',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              style={{
                flex: 1,
                padding: '10px 16px',
                backgroundColor: '#dbfe01',
                color: '#000000',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
