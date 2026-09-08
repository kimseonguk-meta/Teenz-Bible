import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.teenzbible.app',
  appName: 'Teenz Bible',
  webDir: 'dist/public',
  server: {
    // For native, we bundle everything. No remote URL.
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
