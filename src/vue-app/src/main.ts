import { createApp } from 'vue'
import './assets/main.css';
import './assets/tailwind.css';
import App from './App.vue'
import router from './router/index.ts';
import {logger } from "@space-x/shared/logger";

const app = createApp(App);

// Global Vue error handler
app.config.errorHandler = (err, instance, info) => {
    logger.error('Vue error', { err, info });
};

// Global promise rejection handler
window.addEventListener('unhandledrejection', event => {
    logger.error('Unhandled Promise rejection', event.reason);
});

app.use(router)
app.mount('#app')
