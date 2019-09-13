<template>
  <modal
    class="modal"
    name="factsheet-relationship-tree-modal"
    :adaptive="true"
    :height="'auto'"
    :resizable="true"
    :draggable="false"
    :scrollable="true"
    :reset="true"
    @before-open="beforeOpen"
    @opened="opened"
    @closed="closed"
    >
    <div class="modal-container">
      <div class="modal-header relative">
        <a href="javascript:;" @click="$modal.hide('factsheet-relationship-tree-modal')" class="close absolute top-0 right-0 p-3">x</a>
        <div class="text-2xl font-semibold">
          Relationship Tree
        </div>
        <span class="text-lg p-1 rounded" :style="getFactSheetTypeStyle(factSheet.type)">{{factSheet.name | truncate}}</span>
      </div>
      <div class="p-5">
        <div
          class="flex flex-col items-center"
          ref="chart-container"
          style="min-height: 500px">
        </div>
        <div class="border pt-1 flex flex-wrap justify-center">
          <div
            v-for="node in legendFactSheetTypes"
            :key="node.type"
            :style="getFactSheetTypeStyle(node.type)"
            class="mr-1 mb-1 p-1 rounded text-xs">
            {{node.label}}
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button
          @click="$modal.hide('factsheet-relationship-tree-modal')"
          class="w-20 bg-white hover:bg-gray-100 text-grey-600 border-solid border border-gray-400 font-bold py-2 px-4 rounded shadow focus:outline-none mr-1">
          Close
        </button>
      </div>
    </div>
  </modal>
</template>

<script>
import { mapGetters } from 'vuex'
import { Network } from 'vis-network'

export default {
  name: 'FactsheetRelationshipTreeModal',
  data: () => ({
    factSheet: {},
    network: undefined,
    children: [],
    nodes: []
  }),
  filters: {
    truncate (value) {
      const maxLen = 40
      if (!value) return ''
      return value.length > maxLen ? `${value.substr(0, maxLen)}...` : value
    }
  },
  methods: {
    handleChildClickEvt (evt) {
      const { nodes = [] } = evt
      if (!nodes.length) return
      const { options = {} } = this.network.body.nodes[nodes[0]] || {}
      const { id, type } = options
      const link = `${this.baseUrl}/factsheet/${type}/${id}`
      this.$lx.openLink(link)
    },
    getFactSheetTypeStyle (type) {
      const { color, bgColor } = this.viewModel[type] || {}
      return `background: ${bgColor}; color: ${color}`
    },
    beforeOpen (evt) {
      const { params = {} } = evt
      const { factSheet = {}, children = [] } = params
      this.factSheet = factSheet
      this.children = children
    },
    opened (evt) {
      const { id, name, type } = this.factSheet
      let nodes = { [id]: { id, name, type, value: 3 } }
      let edges = []
      if (this.children.length) {
        const network = this.children
          .reduce((accumulator, child) => {
            const { parentNodeTree = [] } = child
            nodes[child.id] = { id: child.id, name: child.name, type: child.type }
            parentNodeTree.forEach((parent, idx, tree) => {
              nodes[parent.id] = { id: parent.id, name: parent.name, type: parent.type }
              edges.push({ from: parent.id, to: idx === 0 ? child.id : tree[idx - 1].id })
            })
            return { nodes, edges }
          }, { nodes, edges })
        nodes = Object.values(network.nodes)
          .map(node => {
            const { id, type, name } = node
            const label = name.length > 60 ? name.substring(0, 60) + '...' : name
            const fsTypeViewModel = this.viewModel[type] || {}
            const { color, bgColor } = fsTypeViewModel
            const font = { color }
            return { id, type, name, label, color: bgColor, font }
          })
        // compute the weights for each edge
        edges = Object.entries(network.edges
          .reduce((accumulator, edge) => {
            const { from, to } = edge
            if (!accumulator[from]) accumulator[from] = {}
            if (!accumulator[from][to]) accumulator[from][to] = 0
            accumulator[from][to]++
            return accumulator
          }, {}))
          .reduce((accumulator, [ from, targets ]) => {
            const edges = Object.entries(targets)
              .map(([to, width]) => ({ from, to, width }))
            return [...accumulator, ...edges]
          }, [])
      } else {
        nodes = this.parentNodeTree
          .map(({ id, type, name }, idx) => {
            const label = name.length > 60 ? name.substring(0, 60) + '...' : name
            const fsTypeViewModel = this.viewModel[type] || {}
            const { color, bgColor } = fsTypeViewModel
            const font = { color }
            return { id, type, name, label, color: bgColor, font }
          })
        edges = this.parentNodeTree
          .map((node, idx, tree) => {
            const isLastNode = idx === (tree.length - 1)
            if (!isLastNode) {
              const nextNode = tree[idx + 1]
              const from = node.id
              const to = nextNode.id
              return { from, to }
            }
          })
          .filter(link => !!link)
      }

      const containerEl = this.$refs['chart-container']
      const { offsetHeight } = containerEl
      const data = { nodes, edges }
      const options = {
        autoResize: true,
        height: `${offsetHeight}px`,
        clickToUse: true,
        nodes: {
          shape: 'box',
          widthConstraint: {
            maximum: 150
          },
          font: {
            size: 12,
            face: 'helvetica'
          },
          scaling: {
            label: {
              enabled: true
            }
          }
        },
        edges: {
          arrows: {
            to: {
              enabled: true
              // type: 'triangle'
            }
          },
          arrowStrikethrough: true
        },
        interaction: {
          dragNodes: true,
          dragView: true,
          zoomView: true
        },
        layout: {
          hierarchical: {
            enabled: false
            // levelSeparation: 150,
            // direction: 'UD'
          }
        },
        physics: {
          enabled: true
        }
      }
      this.nodes = nodes
      console.log('NODES', this.nodes)
      this.network = new Network(containerEl, data, options)
      this.network.on('click', this.handleChildClickEvt)
    },
    closed (evt) {
      if (this.network) {
        this.network.off('click')
        this.network.destroy()
      }
    }

  },
  computed: {
    ...mapGetters({
      factSheetTypes: 'performance/factSheetTypes',
      viewModel: 'performance/viewModel',
      baseUrl: 'performance/baseUrl'
    }),
    name () {
      const { name } = this.factSheet || {}
      return name
    },
    type () {
      const { type } = this.factSheet || {}
      return type
    },
    parentNodeTree () {
      const { type, id, name } = this.factSheet || {}
      const thisNode = { type, id, name }
      let { parentNodeTree = [] } = this.factSheet || {}

      parentNodeTree = [...parentNodeTree]
      parentNodeTree.unshift(thisNode)
      return parentNodeTree
        .reverse()
        .map(node => {
          const { type } = node
          const label = type ? this.$lx.translateFactSheetType(type) : ''
          return { ...node, label }
        })
    },
    legendFactSheetTypes () {
      const types = Object.values(this.nodes
        .reduce((accumulator, { type }) => ({
          ...accumulator,
          [type]: { type, label: this.$lx.translateFactSheetType(type) }
        }), {}))
      return types
    }
  }
}
</script>

<style lang="stylus" scoped>
.v--modal-overlay[data-modal="factsheet-relationship-tree-modal"]
  background rgba(0, 0, 0, 0.5)

.modal-container
  height 100%
  display flex
  flex-flow column

.modal-header
  padding 9px 15px
  border-bottom 1px solid #eee
  background #f5f5f5
  & h3
    margin 0
    line-height 30px
    font-size 24.5px
    font-weight bold

.modal-body
  flex 1
  padding 0 15px

.modal-footer
  padding 14px 15px 15px
  margin-bottom 0
  background #f5f5f5
  border-top 1px solid #ddd
  border-radius 0 0 6px 6px
  display flex
  justify-content flex-end

.close
  float right
  font-size 20px
  font-weight bold
  line-height 20px
  color #000
  text-shadow 0 1px 0 #fff
  opacity .2

.config-heading
  font-size 16px
  margin-bottom 8px
  font-weight bold

.config-line
  margin-bottom 9px

.config-label
  float left
  line-height 30px
  padding-right 10px
  font-weight bold
  min-width 52px

.config-content-wrapper
  overflow hidden
  position relative
  line-height 30px

.config-content
  width 100%
  box-sizing border-box
  min-height 30px
  margin 0
  background-color #fff !important

select
  border 1px solid #ccc
  height 30px
  line-height 30px
  display inline-block
  padding 4px 6px
  font-size 14px
  color #555
  vertical-align middle
  border-radius 4px
  outline none

label
  font-size 14px
  font-weight normal
  line-height 20px

label.checkbox
  display inline-block
  font-weight bold
  margin 0

.truncate
  white-space nowrap
  overflow hidden
  text-overflow ellipsis
</style>

<style lang="stylus">
.vis-network
  outline none
</style>
