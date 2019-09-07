import state from './state.js'
import * as getters from './getters'
import * as actions from './actions'
import * as mutations from './mutations'
import plugins from './plugins'

export { plugins }

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
