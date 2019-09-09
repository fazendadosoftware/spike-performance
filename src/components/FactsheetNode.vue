<template>
  <div class="absolute bg-transparent rounded border p-1 m-1" :style="nodeStyle">NODE {{node.type}} {{node.label}}</div>
</template>
<script>
export default {
  name: 'FactsheetNode',
  props: {
    node: {
      type: Object,
      required: true
    }
  },
  data: () => ({
    clientDims: { width: 0, height: 0 }
  }),
  computed: {
    nodeStyle () {
      const { width = 0, height = 0 } = this.clientDims
      const { x, y } = this.node
      const style = `left: ${x - (width / 2)}px; top: ${y - (height / 2)}px`
      return style
    }
  },
  mounted () {
    const { clientWidth = 0, clientHeight = 0 } = this.$el || {}
    this.clientDims = { width: clientWidth, height: clientHeight }
  }
}
</script>
