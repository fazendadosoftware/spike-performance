import Vue from 'vue'
import App from './App'
import Notifications from 'vue-notification'
import devtools from '@vue/devtools'
import store from './store'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import VueObserveVisibility from 'vue-observe-visibility'
import '@leanix/reporting'

import '@/assets/css/tailwind.css'

[faPlus, faMinus].forEach(icon => library.add(icon))

Vue.component('font-awesome-icon', FontAwesomeIcon)
Vue.use(VueObserveVisibility)
Vue.use(Notifications)

/* global lx */
Vue.prototype.$lx = lx

Vue.config.productionTip = false

if (process.env.NODE_ENV === 'development') {
  devtools.connect(/* host, port */)
}

new Vue({ store, render: h => h(App) }).$mount('#app')
