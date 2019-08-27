// https://github.com/vuejs/vuex/blob/dev/examples/todomvc/store/plugins.js
import { debounce } from './helpers'

const performancePlugin = store => {
  const debounceFn = debounce(() => store.dispatch('performance/fetchViewPortDataset'), 500)

  // called when the store is initialized
  store.subscribe((mutation, state) => {
    const { type } = mutation
    if (type === 'performance/setViewPortDatasetFactSheet') debounceFn()
  })

  store.watch(
    () => store.getters['performance/viewPortDataset'],
    (newVal, oldVal) => {
      console.log('VIEW PORT DATASET CHANGED', newVal, oldVal)
    }
  )
  store.watch(
    () => store.getters['performance/queries'],
    (newVal, oldVal) => {
      if (!oldVal && newVal) lx.showSpinner()
      else if (!newVal && oldVal) lx.hideSpinner()
    }
  )
}

export default [performancePlugin]
