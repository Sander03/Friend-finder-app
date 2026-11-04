import { useEffect } from 'react';
import { Platform } from 'react-native';

interface WakeLockSentinel {
  release: () => Promise<void>;
}

// Houdt het scherm aan zolang enabled true is (Screen Wake Lock API in de browser).
export function useKeepAwake(enabled: boolean): void {
  useEffect(() => {
    if (!enabled || Platform.OS !== 'web' || typeof navigator === 'undefined') return;
    const wakeLock = (navigator as Navigator & { wakeLock?: { request: (type: 'screen') => Promise<WakeLockSentinel> } })
      .wakeLock;
    if (wakeLock === undefined) return;

    let sentinel: WakeLockSentinel | null = null;
    let active = true;
    const request = () => {
      wakeLock
        .request('screen')
        .then((s) => {
          if (active) sentinel = s;
          else void s.release();
        })
        .catch(() => {
          // Niet toegestaan (bv. batterijbesparing): het scherm mag dan gewoon uitgaan.
        });
    };
    // De browser geeft de lock vrij als je van tabblad wisselt; vraag ze opnieuw bij terugkeren.
    const onVisible = () => {
      if (document.visibilityState === 'visible') request();
    };
    request();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      active = false;
      document.removeEventListener('visibilitychange', onVisible);
      void sentinel?.release();
    };
  }, [enabled]);
}
