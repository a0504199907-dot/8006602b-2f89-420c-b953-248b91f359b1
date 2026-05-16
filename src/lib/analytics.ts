// Google Analytics 4 (GA4) initialization
// Uses VITE_GA_MEASUREMENT_ID environment variable

declare global {
    interface Window {
          dataLayer: unknown[];
          gtag: (...args: unknown[]) => void;
    }
}

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string;

export function initGA(): void {
    if (!GA_MEASUREMENT_ID) {
          console.warn('GA: VITE_GA_MEASUREMENT_ID is not set');
          return;
    }

  // Load the gtag.js script
  const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

  // Initialize dataLayer and gtag
  window.dataLayer = window.dataLayer || [];
    window.gtag = function (...args: unknown[]) {
          window.dataLayer.push(args);
    };
    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID, {
          send_page_view: true,
    });
}

export function trackPageView(path: string): void {
    if (!GA_MEASUREMENT_ID || typeof window.gtag !== 'function') return;
    window.gtag('event', 'page_view', {
          page_path: path,
    });
}

export function trackEvent(
    eventName: string,
    params?: Record<string, unknown>
  ): void {
    if (!GA_MEASUREMENT_ID || typeof window.gtag !== 'function') return;
    window.gtag('event', eventName, params);
}
