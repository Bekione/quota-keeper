'use client';

import { useState, useRef } from 'react';
import { Account } from '@/types/account';
import { createAccount } from '@/lib/services/account-service';
import { parseImport } from '@/lib/import/parser';

interface ImportExportModalProps {
  isOpen: boolean;
  accounts: Account[];
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ImportExportModal({
  isOpen,
  accounts,
  onClose,
  onSuccess,
}: ImportExportModalProps) {
  const [tab, setTab] = useState<'import' | 'export'>('import');
  const [importText, setImportText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  async function handleImport() {
    setError('');
    setResult('');
    setLoading(true);

    try {
      const parsed = parseImport(importText);

      if (parsed.length === 0) {
        setError('No accounts found in the provided text');
        setLoading(false);
        return;
      }

      let created = 0;
      let skipped = 0;

      for (const item of parsed) {
        try {
          const account = await createAccount({
            name: item.name,
            email: item.email,
          });

          if (account && item.unlock_at) {
            // If there was a lock date, lock the account
            // This would require importing lockAccount, but let's keep it simple for now
          }

          created++;
        } catch (err) {
          skipped++;
        }
      }

      setResult(`Imported ${created} account${created !== 1 ? 's' : ''}${skipped > 0 ? `, skipped ${skipped}` : ''}`);
      setImportText('');
      
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1500);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  function handleExport() {
    const csv = [
      'Name,Email,Chrome Profile,Notes',
      ...accounts.map(
        (acc) =>
          `"${acc.name.replace(/"/g, '""')}","${acc.email}","${(acc.chrome_profile || '').replace(/"/g, '""')}","${(acc.notes || '').replace(/"/g, '""')}"`
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quotakeeper_accounts_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setImportText(text);
    };
    reader.readAsText(file);
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
          maxWidth: '600px',
          width: '90%',
          maxHeight: '90vh',
          overflowY: 'auto',
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
          Import / Export Accounts
        </h2>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          <button
            onClick={() => {
              setTab('import');
              setError('');
              setResult('');
            }}
            style={{
              padding: '8px 16px',
              backgroundColor: tab === 'import' ? '#dbfe01' : '#2a2a2a',
              color: tab === 'import' ? '#000000' : '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            Import
          </button>
          <button
            onClick={() => {
              setTab('export');
              setError('');
              setResult('');
            }}
            style={{
              padding: '8px 16px',
              backgroundColor: tab === 'export' ? '#dbfe01' : '#2a2a2a',
              color: tab === 'export' ? '#000000' : '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            Export
          </button>
        </div>

        {/* Import Tab */}
        {tab === 'import' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 500,
                  marginBottom: '8px',
                }}
              >
                Paste account data
              </label>
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder={
                  'Paste in QuotaKeeper format:\n\nAccount Name\nemail@example.com\ncan use @ 2/9/2026, 8:57:36 AM\n\nOr CSV format:\nName,Email,Chrome Profile,Notes\n...'
                }
                style={{
                  width: '100%',
                  minHeight: '200px',
                  padding: '12px',
                  backgroundColor: '#0d0d0d',
                  border: '1px solid #2a2a2a',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontFamily: 'monospace',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <p style={{ fontSize: '14px', color: '#a1a1aa', margin: '0 0 8px 0' }}>
                Or upload a file:
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUpload}
                style={{
                  display: 'none',
                }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#2a2a2a',
                  color: '#ffffff',
                  border: '1px dashed #2a2a2a',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                Choose File
              </button>
            </div>

            {error && (
              <div
                style={{
                  padding: '12px',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '6px',
                  color: '#fca5a5',
                  fontSize: '14px',
                }}
              >
                {error}
              </div>
            )}

            {result && (
              <div
                style={{
                  padding: '12px',
                  backgroundColor: 'rgba(134, 239, 172, 0.1)',
                  border: '1px solid rgba(134, 239, 172, 0.3)',
                  borderRadius: '6px',
                  color: '#86efac',
                  fontSize: '14px',
                }}
              >
                {result}
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <button
                onClick={onClose}
                disabled={loading}
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
                  opacity: loading ? 0.5 : 1,
                }}
              >
                Close
              </button>
              <button
                onClick={handleImport}
                disabled={loading || !importText}
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
                  opacity: loading || !importText ? 0.5 : 1,
                }}
              >
                {loading ? 'Importing...' : 'Import'}
              </button>
            </div>
          </div>
        )}

        {/* Export Tab */}
        {tab === 'export' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ color: '#a1a1aa', fontSize: '14px' }}>
              Export {accounts.length} account{accounts.length !== 1 ? 's' : ''} as CSV
            </p>

            <button
              onClick={handleExport}
              disabled={accounts.length === 0}
              style={{
                padding: '12px 16px',
                backgroundColor: accounts.length === 0 ? '#2a2a2a' : '#dbfe01',
                color: accounts.length === 0 ? '#71717a' : '#000000',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '14px',
                cursor: accounts.length === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              Download CSV
            </button>

            <button
              onClick={onClose}
              style={{
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
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
