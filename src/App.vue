<template>
  <div id="app">
    <notifications group="custom-report" />
    <configuration-modal />
    <factsheet-dependency-tree-modal />
    <div class="flex justify-end px-5">
      <div
        @click="!!queries ? undefined : fetchViewPortDataset()"
        :class="!!queries ? 'opacity-50' : 'cursor-pointer'"
        class="border border-gray-400 rounded text-center px-2 py-1">
        <font-awesome-icon icon="sync" :spin="!!queries"/>
      </div>
    </div>
    <div class="overflow-hidden mt-4 flex-1 flex flex-col">
      <div class="flex-1 overflow-auto flex items-start justify-start cards-container" ref="cards-container">
        <fact-sheet-card
          v-for="factSheet in dataset"
          :key="factSheet.id"
          :fact-sheet="factSheet"
          v-observe-visibility="{
            callback: (isVisible, entry) => factSheetVisibilityEvtHandler({ isVisible, entry, factSheet }),
            throttle: 0
          }"
          />
      </div>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapGetters, mapActions } from 'vuex'
import ConfigurationModal from './components/ConfigurationModal'
import FactsheetDependencyTreeModal from './components/FactsheetDependencyTreeModal'
import FactSheetCard from './components/FactSheetCard'

export default {
  name: 'app',
  components: { ConfigurationModal, FactsheetDependencyTreeModal, FactSheetCard },
  computed: {
    ...mapGetters({
      reportSetup: 'performance/reportSetup',
      tree: 'performance/tree',
      dataset: 'performance/dataset',
      viewPortDataset: 'performance/viewPortDataset',
      queries: 'performance/queries'
    })
  },
  methods: {
    ...mapActions({
      generateReportConfiguration: 'performance/generateReportConfiguration',
      factSheetVisibilityEvtHandler: 'performance/factSheetVisibilityEvtHandler',
      fetchViewPortDataset: 'performance/fetchViewPortDataset'
    }),
    ...mapMutations({
      setReportSetup: 'performance/setReportSetup',
      setCustomState: 'performance/setCustomState',
      setDefaultConfiguration: 'performance/setDefaultConfiguration'
    })
  },
  async created () {
    const reportSetup = await this.$lx.init()
    console.debug(`Report Setup`, reportSetup)
    const { config = {}, savedState = {} } = reportSetup
    const { customState } = savedState || {}
    this.setDefaultConfiguration(config)
    if (customState) this.setCustomState(customState)
    this.setReportSetup(reportSetup)
    const reportConfiguration = await this.generateReportConfiguration({ vm: this })
    this.$lx.ready(reportConfiguration)
  }
}
</script>

<style lang="stylus">

#app
  font-family: "Axiforma", "Helvetica Neue", Helvetica, Arial, sans-serif
  font-size 12px
  -webkit-font-smoothing antialiased
  -moz-osx-font-smoothing grayscale
  color #333
  height 100vh
  display flex
  flex-flow column
</style>
