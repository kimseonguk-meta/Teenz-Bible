/// <reference types="@capacitor-firebase/authentication" />

import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.teenzbible.app',
  appName: 'Teenz Bible',
  webDir: 'dist/public',
  plugins: {
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ["apple.com", "google.com"],
    },
    Camera: {
      presentationStyle: 'popover',
    },
  },
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
  },
};

export default config;
