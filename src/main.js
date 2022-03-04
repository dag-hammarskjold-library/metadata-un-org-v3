import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createI18n } from 'vue-i18n'
import App from './App.vue'
import Home from './views/Home.vue'
import { unbistRoutes } from './unbist/routes.js'
import { messages } from './messages.js'
//import {sdgRoutes} from './sdg/routes.js'

let mainRoutes = [
    { path: '/', name: 'Home', component: Home}
]
let routes = mainRoutes.concat( unbistRoutes )

const router = createRouter({
    history: createWebHistory(),
    routes: routes
})

const i18n = createI18n({
    fallbackLocale: 'en',
    messages    // consider having separate/additional messages files for each application
})

createApp(App).use(router).use(i18n).mount('#app')
