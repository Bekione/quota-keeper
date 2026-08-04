'use client';

import { useState } from 'react';
import { Account } from '@/types/account';
import { deleteAccount } from '@/lib/services/account-service';

interface DeleteConfirmationProps {
  isOpen: boolean;
  account?: Account;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function DeleteConfirmation({
  isOpen,
  account,
  onClose,
  onSuccess,
}: DeleteConfirmationProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !account) return null;

  async function handleDelete() {
    setError('');
    setLoading(true);

    try {
      const success = await deleteAccount(account.id);

      if (success) {
        onSuccess?.();
        onClose();
      } else {
        setError('Failed to delete account');
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
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
          maxWidth: '400px',
          width: '90%',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          style={{
            fontSize: '24px',
            fontWeight: 700,
            marginBottom: '12px',
            color: '#ef4444',
          }}
        >
          Delete Account
        </h2>
        <p style={{ color: '#a1a1aa', fontSize: '14px', marginBottom: '24px' }}>
          Are you sure you want to delete <strong>{account.name}</strong>? This action cannot be undone.
        </p>

        {error && (
          <div
            style={{
              padding: '12px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '6px',
              color: '#fca5a5',
              fontSize: '14px',
              marginBottom: '16px',
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
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
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            style={{
              flex: 1,
              padding: '10px 16px',
              backgroundColor: '#ef4444',
              color: '#fecaca',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              opacity: loading ? 0.5 : 1,
            }}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
