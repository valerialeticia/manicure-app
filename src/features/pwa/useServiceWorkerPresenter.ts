'use client';

import { useEffect } from 'react';

/**
 * Registra o service worker que permite instalar o app e abri-lo sem internet.
 * Fica desligado em desenvolvimento para o cache não esconder alterações no código.
 */
export function useServiceWorkerPresenter(enabled: boolean = process.env.NODE_ENV === 'production') {
  useEffect(() => {
    if (!enabled || typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;

    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.error('Não foi possível ativar o modo offline.', error);
    });
  }, [enabled]);
}
