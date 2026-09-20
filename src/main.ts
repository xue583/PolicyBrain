import { createApp } from 'vue'
import { createPinia } from 'pinia'
import 'ant-design-vue/dist/reset.css'
import App from './App.vue'
import { router } from './router'
import './style.css'
import './styles/db-list.scss'

const app = createApp(App)

app.config.errorHandler = (err, instance, info) => {
  console.error('[Global Error]', err, info)
}

app.use(createPinia())
app.use(router)
app.mount('#app')
