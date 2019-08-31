<template>
  <div id="app">
    <notifications group="custom-report" />
    <configuration-modal />
    <div class="flex items-start justify-start m-4">
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
</template>

<script>
import { mapMutations, mapGetters, mapActions } from 'vuex'
import ConfigurationModal from './components/ConfigurationModal'
import NodeSelectBox from './components/NodeSelectBox'
import FactSheetCard from './components/FactSheetCard'

export default {
  name: 'app',
  components: { ConfigurationModal, NodeSelectBox, FactSheetCard },
  computed: {
    ...mapGetters({
      reportSetup: 'performance/reportSetup',
      tree: 'performance/tree',
      dataset: 'performance/dataset',
      viewPortDataset: 'performance/viewPortDataset'
    })
  },
  methods: {
    ...mapActions({
      generateReportConfiguration: 'performance/generateReportConfiguration',
      factSheetVisibilityEvtHandler: 'performance/factSheetVisibilityEvtHandler'
    }),
    ...mapMutations({
      setReportSetup: 'performance/setReportSetup'
    })
  },
  async created () {
    const reportSetup = await this.$lx.init()
    this.setReportSetup(reportSetup)
    const config = await this.generateReportConfiguration({ vm: this })
    this.$lx.ready(config)
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
</style>
