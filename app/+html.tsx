import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

const registerServiceWorker =
  "if ('serviceWorker' in navigator) { window.addEventListener('load', function () { navigator.serviceWorker.register('/sw.js').catch(function (e) { console.warn('Service worker niet geregistreerd', e); }); }); }";

const removeServiceWorker =
  "if ('serviceWorker' in navigator) { navigator.serviceWorker.getRegistrations().then(function (regs) { if (regs.length === 0) return; Promise.all(regs.map(function (r) { return r.unregister(); })).then(function () { return caches.keys(); }).then(function (keys) { return Promise.all(keys.map(function (k) { return caches.delete(k); })); }).then(function () { location.reload(); }); }); }";

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="nl">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover" />
        <title>Waarbenje</title>
        <meta name="description" content="Vind je vrienden terug, waar je ook bent: in het park, op het strand of op een festival." />
        <meta name="theme-color" content="#0E0F13" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" type="image/png" href="/icons/icon-192.png" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Waarbenje" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Space+Grotesk:wght@500;700&display=swap"
        />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: 'html, body { background-color: #0E0F13; }' }} />
        <script dangerouslySetInnerHTML={{ __html: process.env.NODE_ENV === 'production' ? registerServiceWorker : removeServiceWorker }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
