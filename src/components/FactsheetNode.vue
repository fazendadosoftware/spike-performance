<template>
  <div class="absolute p-1 m-1" :style="nodeStyle">
    {{node.label}}
  </div>
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
      const clientWidth = 100
      const clientHeight = 40
      // const { clientWidth = 150, clientHeight = 50 } = this.$el || {}
      const { x, y } = this.node
      const style = `width: ${clientWidth}px; height: ${clientHeight}px; left: ${x - (clientWidth / 2)}px; top: ${y - (clientHeight / 2)}px`
      return style
    }
  },
  mounted () {
    const { offsetWidth = 0, offsetHeight = 0 } = this.$el || {}
    this.clientDims = { width: offsetWidth, height: offsetHeight }
  }
}
</script>
