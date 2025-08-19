import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.safespender.planner',
  appName: 'biyuyo',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    StatusBar: {
      overlaysWebView: true,
      style: 'DEFAULT'
    },
    PrivacyScreen: {
      enable: true,
      imageName: 'splash',
      imageScale: 'CENTER_CROP'
    }
  }
}

export default config


