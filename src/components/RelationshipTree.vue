<template>
  <div class="relative">
    <factsheet-node v-for="node in nodes" :key="node.id" :node="node"/>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import FactsheetNode from './FactsheetNode'
import { Network } from 'vis-network'

export default {
  name: 'RelationshipTree',
  components: { FactsheetNode },
  data: () => ({
    factSheet: {},
    network: undefined,
    overlayComponents: [],
    nodes: []
  }),
  methods: {
    getNodeCoords (node) {
      const { id } = node
      const pos = this.network.getPositions([id])
      const coords = this.network.canvasToDOM({ x: pos[id].x, y: pos[id].y })
      return { ...node, ...coords }
    },
    updateNetwork () {
      const { nodes, edges } = this.treeData
      if (this.network) this.network.destroy()
      const options = {
        autoResize: true,
        height: `${300}px`,
        nodes: {
          shape: 'box',
          widthConstraint: {
            minimum: 150,
            maximum: 150
          },
          heightConstraint: {
            minimum: 40
          }
        },
        edges: {
          arrows: 'to'
        },
        interaction: {
          dragNodes: false,
          dragView: false,
          zoomView: false
        },
        layout: {
          hierarchical: {
            enabled: true,
            levelSeparation: 90,
            direction: 'UD'
          }
        },
        physics: {
          enabled: false
        }
      }
      this.network = new Network(this.$el, { nodes, edges }, options)
      this.network.on('afterDrawing', () => { this.nodes = nodes.map(this.getNodeCoords) })
      this.network.on('beforeDrawing', () => { this.nodes = [] })
    }
  },
  computed: {
    ...mapGetters({
      tree: 'performance/tree',
      viewModel: 'performance/viewModel'
    }),
    treeData () {
      const nodes = [...this.tree]
        .map(({ relationType, factSheetType, targetFactSheetType }, idx, tree) => {
          const fsTypeViewModel = this.viewModel[factSheetType] || {}
          const { color, bgColor } = fsTypeViewModel
          const font = { color }
          return { id: relationType, relationType, label: factSheetType, color: bgColor, font, shape: 'box', hidden: false }
        })
      const edges = this.tree
        .map((node, idx, tree) => {
          const isLastNode = idx === (tree.length - 1)
          if (!isLastNode) {
            const nextNode = tree[idx + 1]
            const from = node.relationType
            const to = nextNode.relationType
            return { from, to, arrows: 'to' }
          }
        })
        .filter(link => !!link)
      const data = { nodes, edges }
      return data
    }
  },
  mounted () {
    this.updateNetwork()
  },
  beforeDestroy () {
    this.network.off('click')
    this.network.destroy()
  }
}
</script>
