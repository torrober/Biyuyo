import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.safespender.planner',
  appName: 'safe-spend-planner',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
}

export default config


