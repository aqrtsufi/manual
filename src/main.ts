import { createApp } from 'vue'
import { registerSW } from 'virtual:pwa-register'
import App from './App.vue'
import { router } from './router'
import './style.css'
import './manual-logical.css'

registerSW({
  immediate: true,

  onRegisteredSW(swUrl, registration) {
    const checkForUpdate = async () => {
      if (!registration || registration.installing || !navigator.onLine) {
        return
      }

      try {
        const response = await fetch(swUrl, {
          cache: 'no-store',
          headers: {
            'cache': 'no-store',
            'cache-control': 'no-cache'
          }
        })

        if (response.ok) {
          await registration.update()
        }
      } catch (error) {
        console.warn('Unable to check for an AQRT Manual update:', error)
      }
    }

    void checkForUpdate()

    window.addEventListener('focus', () => {
      void checkForUpdate()
    })

    window.addEventListener('online', () => {
      void checkForUpdate()
    })

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        void checkForUpdate()
      }
    })
  }
})

createApp(App).use(router).mount('#app')
