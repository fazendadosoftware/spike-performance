import Vue from 'vue'
import Vuex from 'vuex'
import createLogger from './logger'
import performance, { plugins as performancePlugins } from './modules/performance/'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
  modules: {
    performance
  },
  strict: debug,
  plugins: [debug ? createLogger() : undefined, ...performancePlugins]
})
