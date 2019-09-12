<template>
  <div class="flex flex-col bg-red-300 justify-center">
    <div v-for="node in treeData.nodes" :key="node.id">
      {{node.label}}
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'RelationshipTree',
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
  }
}
</script>
