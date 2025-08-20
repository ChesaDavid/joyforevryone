import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.joyforeveryone.mobile',
  appName: 'JoyForEveryone',
  webDir: '.next/standalone', // This is ignored when server.url is set
  server: {
    url: 'https://joyforevryone--jfe-site.europe-west4.hosted.app/', // <-- Your Firebase Hosting URL
    cleartext: true,
  }
};
export default config;