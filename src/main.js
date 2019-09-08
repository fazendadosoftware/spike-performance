import Vue from 'vue'
import App from './App'
import Notifications from 'vue-notification'
import VTooltip from 'v-tooltip'
import vmodal from 'vue-js-modal'
// import devtools from '@vue/devtools'
import store from './store'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faPlus, faMinus, faSpinner, faSync } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import VueObserveVisibility from 'vue-observe-visibility'
import '@leanix/reporting'

import '@/assets/css/tailwind.css'
import '@/assets/css/tooltip.css'

[faPlus, faMinus, faSpinner, faSync].forEach(icon => library.add(icon))

Vue.component('font-awesome-icon', FontAwesomeIcon)
Vue.use(VueObserveVisibility)
Vue.use(Notifications)
Vue.use(vmodal)
Vue.use(VTooltip)

/* global lx */
Vue.prototype.$lx = lx

Vue.config.productionTip = false

if (process.env.NODE_ENV === 'development') {
  // devtools.connect(/* host, port */)
}

const app = new Vue({ store, render: h => h(App) }).$mount('#app')
store.$app = app
