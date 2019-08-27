<template>
  <div id="app" class="flex relative bg-gray-700 shadow-lg border-solid border rounded" :style="`height:calc(100vh - 20px)`">
    <notifications group="custom-report" />
    <div class="flex flex-col justify-center items-center absolute top-0 left-0">
      <div class="flex flex-col items-start bg-blue-300 p-4 m-4 shadow-md">
        <node-select-box
          v-for="(node, idx) in tree"
          :key="idx"
          :idx="idx"
          :node="node"
        />
      </div>
      <div class="bg-white p-4 m-4 shadow-md w-64">
        <h4>Viewport</h4>
        <div class="mb-1" v-for="(factSheetName, idx) in Object.keys(viewPortDataset).sort()" :key="idx">
          {{factSheetName}}
        </div>
      </div>
    </div>
    <div class="flex flex-wrap items-center justify-center absolute top-0 right-0 h-full w-3/4 overflow-auto">
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
import NodeSelectBox from './components/NodeSelectBox'
import FactSheetCard from './components/FactSheetCard'

export default {
  name: 'app',
  components: { NodeSelectBox, FactSheetCard },
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
    const config = await this.generateReportConfiguration()
    this.$lx.ready(config)
  }
}
</script>

<style lang="stylus">

#app
  font-family 'Avenir', Helvetica, Arial, sans-serif
  -webkit-font-smoothing antialiased
  -moz-osx-font-smoothing grayscale
  text-align center
  color #2c3e50
</style>
