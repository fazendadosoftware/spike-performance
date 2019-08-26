<template>
  <div id="app" class="flex relative bg-gray-700 shadow-lg border-solid border rounded" :style="`height:calc(100vh - 20px)`">
    <notifications group="custom-report" />
    <div class="flex flex-col justify-center items-center absolute top-0 left-0 w-1/4">
      <div class="flex flex-col items-start bg-blue-300 p-4 m-4 shadow-md">
        <node-select-box
          v-for="(node, idx) in tree"
          :key="idx"
          :idx="idx"
          :node="node"
          :factSheetTypes="factSheetTypes"
          :tree="tree"
          @node-update="onNodeUpdate"
          @add-node="onAddNode"
          @remove-node="onRemoveNode"
        />
      </div>
      <div class="bg-white p-4 m-4 shadow-md w-64">
        <h4>Viewport</h4>
        <div class="mb-1" v-for="(factSheetName, idx) in Object.keys(visibleFactSheets).sort()" :key="idx">
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
          callback: (isVisible, entry) => visibilityChanged(isVisible, entry, factSheet),
          throttle: 0
        }"
        />
    </div>
  </div>
</template>

<script>
import { mapMutations, mapGetters } from 'vuex'
import NodeSelectBox from './components/NodeSelectBox'
import FactSheetCard from './components/FactSheetCard'
import Performance from './helpers/performance'

export default {
  name: 'app',
  components: { NodeSelectBox, FactSheetCard },
  data () {
    return {
      tree: [],
      factSheetTypes: [],
      performance: undefined,
      dataset: [],
      visibleFactSheets: {}
    }
  },
  computed: {
    ...mapGetters({
      reportSetup: 'performance/reportSetup'
    })
  },
  methods: {
    ...mapMutations({
      setReportSetup: 'performance/setReportSetup'
    }),
    onNodeUpdate (treeIdx, node) {
      this.performance.updateNode(treeIdx, node)
    },
    onAddNode () {
      this.performance.pushNode()
    },
    onRemoveNode () {
      this.performance.popNode()
    },
    visibilityChanged (isVisible, entry, factSheet) {
      if (isVisible) {
        this.$set(this.visibleFactSheets, factSheet.name, { id: factSheet.id })
      } else {
        delete this.visibleFactSheets[factSheet.name]
      }
      this.performance.viewPortDataset = this.visibleFactSheets
      this.performance.debounceFn()
    }
  },
  created () {
    this.performance = new Performance()

    this.performance.on('tree', tree => { this.tree = tree })

    this.performance.on('factSheetTypes', factSheetTypes => { this.factSheetTypes = factSheetTypes })

    this.performance.on('fetching-data', viewPortDataset => {
      const dataset = Object.keys(viewPortDataset)
        .sort()
      this.$notify({
        group: 'custom-report',
        // type: 'warn',
        title: `Query start, ${this.tree.length} hop${this.tree.length === 1 ? '' : 's'}`,
        text: `${dataset[0]} / ${dataset[dataset.length - 1]}`
      })
    })

    this.performance.on('dataset', dataset => {
      this.visibleFactSheets = []
      this.dataset = dataset
    })

    this.$lx.init()
      .then(reportSetup => {
        this.setReportSetup(reportSetup)
        this.performance.reportSetup = reportSetup
        const config = this.performance.generateReportConfiguration()
        this.tree = this.performance.tree
        this.$lx.ready(config)
      })
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
