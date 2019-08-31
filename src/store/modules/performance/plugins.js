import { debounce } from './helpers'

const performancePlugin = store => {
  const debounceFn = debounce(() => store.dispatch('performance/fetchViewPortDataset'), 200)

  // called when the store is initialized
  store.subscribe((mutation, state) => {
    const { type } = mutation
    if (type === 'performance/setViewPortDatasetFactSheet') debounceFn()
  })

  store.watch(
    () => store.getters['performance/queries'],
    (newVal, oldVal) => {
      if (!oldVal && newVal) lx.showSpinner()
      else if (!newVal && oldVal) lx.hideSpinner()
    }
  )

  store.watch(
    () => store.getters['performance/treeEndpointFactSheetTypes'],
    async () => {
      const { _vm } = store
      const config = await store.dispatch('performance/generateReportConfiguration', { vm: _vm })
      lx.updateConfiguration(config)
    }
  )
}

export default [performancePlugin]
