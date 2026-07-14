import { useEffect } from 'react';

export default function AccessibilityAnnouncer() {
  useEffect(() => {
    const handler = () => {
      const liveRegion = document.getElementById('live-region');
      if (liveRegion) {
        liveRegion.textContent = 'Content updated';
      }
    };

    window.addEventListener('focus', handler);
    return () => window.removeEventListener('focus', handler);
  }, []);

  return <div id="live-region" className="sr-only" aria-live="polite" aria-atomic="true" />;
}
