import { createApp } from 'vue'
import { Quasar } from 'quasar'

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


app.mount('#app')
