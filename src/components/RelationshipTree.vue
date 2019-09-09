<template>
  <div class="relative">
    <factsheet-node v-for="node in nodes" :key="node.id" :node="node"/>
  </div>
</template>

<script>
import FactsheetNode from './FactsheetNode'
import { Network } from 'vis-network'

export default {
  name: 'RelationshipTree',
  components: { FactsheetNode },
  data: () => ({
    factSheet: {},
    network: undefined,
    nodes: [],
    overlayComponents: []
  }),
  methods: {
    getNodeCoords (node) {
      const { id } = node
      const pos = this.network.getPositions([id])
      const coords = this.network.canvasToDOM({ x: pos[id].x, y: pos[id].y })
      return { ...node, ...coords }
    }
  },
  mounted () {
    const nodes = [
      { id: 1, label: '1' },
      { id: 2, label: '2' }
    ]
    const edges = [
      { from: 1, to: 2, label: '1' },
      { from: 2, to: 1, label: '2' }
    ]
    this.network = new Network(this.$el, { nodes, edges }, {})
    this.network.on('afterDrawing', () => { this.nodes = nodes.map(this.getNodeCoords) })
    this.network.on('beforeDrawing', () => { this.nodes = [] })
  },
  beforeDestroy () {
    this.network.off('click')
    this.network.destroy()
  }
}
</script>
