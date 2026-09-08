import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.teenzbible.app',
  appName: 'Teenz Bible',
  webDir: 'dist/public',
  server: {
    // Load the live PWA so the App Store build always shows the latest web code.
    // After this one build, PWA deploys reflect in the iOS app with no new binary.
    url: 'https://teens-bible-94271.web.app',
    cleartext: false,
    androidScheme: 'https',
    iosScheme: 'https',
  },
  plugins: {
    // No Capgo updater - direct build per user decision (no OTA subscription)
  },
  ios: {
    contentInset: 'always',
  },
  android: {
    // Ensure chunk loading works with bundled assets
    allowMixedContent: true,
  },
};

export default config;
