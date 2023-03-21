import { createApp } from 'vue'
import { Quasar } from 'quasar'
import * as Sentry from "@sentry/vue";
import { BrowserTracing } from "@sentry/tracing";

// Import icon libraries
import '@quasar/extras/material-icons/material-icons.css'

// Import Quasar css
import 'quasar/src/css/index.sass'

import App from './App.vue'

import './assets/main.css'

const app = createApp(App)

app.use(Quasar, {
  plugins: {}, // import Quasar plugins and add here
})

Sentry.init({
  app,
  dsn: "https://1ba0e1d571064f27b0cd908bb3783ae8@o4504867199385600.ingest.sentry.io/4504867201155072",
  integrations: [
    new BrowserTracing({
      routingInstrumentation: Sentry.vueRouterInstrumentation(router),
      tracePropagationTargets: ["localhost", "nstielau.github.io", /^\//],
    }),
  ],
  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});

app.mount('#app')
