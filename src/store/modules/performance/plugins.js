import { debounce } from './helpers'

const performancePlugin = store => {
  const debounceFn = debounce(() => store.dispatch('performance/fetchViewPortDataset'), 200)

  // called when the store is initialized

  store.subscribe((mutation, state) => {
    if (mutation.type === 'performance/setDataset') debounceFn()
    if (mutation.type === 'performance/setViewPortDatasetFactSheet' && !state.performance.fetchCompleteDataset) debounceFn()
  })

  // update viewport whenever the "fetchCompleteDataset" setting changes
  store.watch(() => store.getters['performance/fetchCompleteDataset'], () => debounceFn())

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

  // publish state whenever it changes
  store.watch(
    () => store.getters['performance/reportConfigurationState'],
    reportConfigurationState => lx.publishState(reportConfigurationState)
  )
}

export default [performancePlugin]
