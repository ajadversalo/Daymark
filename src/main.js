import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import { registerSW } from 'virtual:pwa-register';
import App from './App.vue';
import Dashboard from './views/Dashboard.vue';
import Settings from './views/Settings.vue';
import './style.css';
registerSW({ immediate: true });
const router = createRouter({ history: createWebHistory(), routes: [
        { path: '/', component: Dashboard }, { path: '/settings', component: Settings }
    ] });
createApp(App).use(router).mount('#app');
