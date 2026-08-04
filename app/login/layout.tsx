import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'QuotaKeeper - Login',
  description: 'AI Account Quota Manager',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
