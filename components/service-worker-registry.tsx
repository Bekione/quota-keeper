'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegistry() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Register service worker for offline support
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('[ServiceWorker] Registered successfully:', registration.scope);
          
          // Check for updates periodically
          const updateTimer = setInterval(() => {
            registration.update().catch(() => {
              // Ignore errors
            });
          }, 60000); // Check every minute

          return () => clearInterval(updateTimer);
        })
        .catch((error) => {
          console.error('[ServiceWorker] Registration failed:', error);
        });

      // Listen for controller change (new SW activated)
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
      });
    }
  }, []);

  return null;
}
