import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './components/router'

import { vuetify } from './plugins/vuetify'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

createApp(App).use(router).use(vuetify).mount('#app')
