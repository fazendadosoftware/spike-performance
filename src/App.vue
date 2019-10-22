<template>
  <div id="app">
    <notifications group="custom-report" />
    <configuration-modal />
    <factsheet-relationship-tree-modal />
    <div class="flex justify-end px-5">
      <sort-control class="mr-6"/>
      <zoom-control class="mr-6"/>
      <refresh-control/>
    </div>
    <div class="overflow-hidden mt-4 flex-1 flex flex-col">
      <div class="overflow-auto flex" :class="wrapLayout ? '' : 'flex-1'">
        <div
          class="cards-container flex-1 flex"
          :class="wrapLayout ? 'flex-wrap items-start justify-center' : 'items-start justify-start'"
          :style="`${cardsContainerScaledStyle}`"
          ref="cards-container">
          <fact-sheet-card
            v-for="factSheet in sortedDataset"
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
  </div>
</template>

<script>
import { mapMutations, mapGetters, mapActions } from 'vuex'
import ConfigurationModal from './components/ConfigurationModal'
import FactsheetRelationshipTreeModal from './components/FactsheetRelationshipTreeModal'
import FactSheetCard from './components/FactSheetCard'
import ZoomControl from './components/ZoomControl'
import SortControl from './components/SortControl'
import RefreshControl from './components/RefreshControl'

export default {
  name: 'app',
  components: {
    ConfigurationModal,
    FactsheetRelationshipTreeModal,
    FactSheetCard,
    ZoomControl,
    SortControl,
    RefreshControl
  },
  computed: {
    ...mapGetters({
      reportSetup: 'performance/reportSetup',
      tree: 'performance/tree',
      dataset: 'performance/dataset',
      viewPortDataset: 'performance/viewPortDataset',
      isIE: 'performance/isIE',
      currentZoom: 'performance/currentZoom',
      childFactSheetNameSorting: 'performance/childFactSheetNameSorting',
      wrapLayout: 'performance/wrapLayout'
    }),
    cardsContainerScaledStyle () {
      const transform = `transform-origin: top left; transform: scale(${this.currentZoom / 100}, ${this.currentZoom / 100})`
      const style = `${transform}`
      return style
    },
    sortedDataset () {
      return [...this.dataset]
        .sort((A, B) => A.name > B.name ? 1 : A.name < B.name ? -1 : 0)
    }
  },
  methods: {
    ...mapActions({
      generateReportConfiguration: 'performance/generateReportConfiguration',
      factSheetVisibilityEvtHandler: 'performance/factSheetVisibilityEvtHandler'
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
