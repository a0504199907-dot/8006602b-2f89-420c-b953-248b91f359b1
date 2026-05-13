import { ReactNode } from 'react';
import { RTLProvider } from '@/contexts/RTLContext';
import { AuthProvider } from '@/contexts/AuthContext';

/**
 * ⚠️ App-wide providers. Add new providers here — they'll be available in all routes.
 */

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <RTLProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </RTLProvider>
  );
}
