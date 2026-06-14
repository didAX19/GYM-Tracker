import { ScrollViewStyleReset } from 'expo-router/html';
import React from 'react';

/**
 * Web-only HTML shell. Configures the page so the app behaves like a native
 * app when added to the iPhone Home Screen (standalone PWA): full-bleed safe
 * areas, no rubber-band overscroll, no tap highlight or accidental text
 * selection, and a theme-aware background.
 */
export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        {/* viewport-fit=cover lets content extend under the notch / home bar so
            safe-area insets can be applied; lock scaling for an app-like feel. */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
        />

        {/* Add-to-Home-Screen (standalone) support */}
        <meta name="application-name" content="Gym Tracker" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Gym Tracker" />

        {/* Status bar / browser chrome color, theme-aware */}
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#F2F4F8" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#0B0F16" />

        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" href="/favicon.png" />

        <ScrollViewStyleReset />

        <style dangerouslySetInnerHTML={{ __html: appShellStyles }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const appShellStyles = `
html, body, #root {
  height: 100%;
}
body {
  /* Prevent the whole page from rubber-band scrolling; inner ScrollViews scroll instead. */
  overscroll-behavior-y: none;
  -webkit-tap-highlight-color: transparent;
  background-color: #F2F4F8;
}
@media (prefers-color-scheme: dark) {
  body { background-color: #0B0F16; }
}
* {
  /* App-like: no long-press text selection or callouts, faster taps. */
  -webkit-user-select: none;
  user-select: none;
  -webkit-touch-callout: none;
  touch-action: manipulation;
}
/* Allow selection/standard behavior inside editable fields. */
input, textarea {
  -webkit-user-select: text;
  user-select: text;
}
/* Center the app in a phone-sized frame on large (desktop) screens. */
#root {
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
}
/* Hide scrollbars for a cleaner, native feel. */
::-webkit-scrollbar { display: none; }
* { scrollbar-width: none; }
`;
