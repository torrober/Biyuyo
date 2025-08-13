import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { StatusBar, Style } from '@capacitor/status-bar'
import { Capacitor } from '@capacitor/core'

async function configureStatusBar() {
  try {
    if (!Capacitor.isNativePlatform()) return
    await StatusBar.setOverlaysWebView({ overlay: true })
    const isDark = document.documentElement.classList.contains('dark')
    await StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light })
    // reserve space for translucent status bar if needed
    document.documentElement.style.setProperty('--statusbar-padding', '28px')
  } catch (_) {
    // no-op on web or if plugin not available
  }
}

configureStatusBar()

createRoot(document.getElementById("root")!).render(<App />);
