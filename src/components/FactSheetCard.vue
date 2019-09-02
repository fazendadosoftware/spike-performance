<template>
  <div class="card-container">
    <div class="card-header relative" :style="headerStyle">
      {{factSheet.name}}
      <transition name="fade">
        <font-awesome-icon v-if="isLoading" icon="spinner" pulse class="absolute top-auto right-0 mr-2"/>
      </transition>
    </div>
    <div class="card-body">
      <div
        v-for="child in children"
        :key="child.id"
        class="child-box"
        :style="getChildStyle(child)">
        <span class="child-name">{{child.name | truncate}}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'FactSheetCard',
  props: {
    factSheet: {
      type: Object,
      required: true
    }
  },
  computed: {
    ...mapGetters({
      view: 'performance/view',
      enrichedDataset: 'performance/enrichedDataset',
      loadingIDs: 'performance/loadingIDs',
      hideEmptyClusters: 'performance/hideEmptyClusters',
      viewModel: 'performance/viewModel'
    }),
    hasChildren () {
      const { id } = this.factSheet
      return !!(this.enrichedDataset[id] || []).length
    },
    childrenCount () {
      return Object.keys(this.children).length
    },
    children () {
      const { id } = this.factSheet
      const enrichedFactSheet = this.enrichedDataset[id]
      let { children = {} } = enrichedFactSheet || {}
      return children
    },
    isLoading () {
      const { id } = this.factSheet
      return this.loadingIDs.indexOf(id) > -1
    },
    isEnriched () {
      const { id } = this.factSheet
      return this.enrichedDataset.hasOwnProperty(id)
    },
    headerStyle () {
      const { type } = this.factSheet
      const { bgColor, color } = this.viewModel[type] || {}
      const style = `background: ${bgColor}; color: ${color}; opacity: ${this.isEnriched ? 1 : 0.8}`
      return style
    }
  },
  methods: {
    getChildStyle (child) {
      const { type, view = {} } = child
      const factSheetViewModel = this.viewModel[type] || {}
      const { bgColor, color, transparency } = view
      const border = `border: 2px solid ${factSheetViewModel.bgColor || '#fff'}`
      return `background: ${bgColor}; color: ${color}; opacity: ${transparency || 1}; ${border}`
    }
  },
  filters: {
    truncate (value) {
      if (!value) return ''
      return value.length > 30 ? `${value.substr(0, 30)}...` : value
    }
  }
}
</script>

<style lang="stylus" scoped>
  .card-container
    background-color #F3F3F3
    border 2px solid #C5C5C5
    border-radius 4px
    margin-right 1rem
    margin-top 1rem
    min-width 300px
    min-height 100px

  .card-header
    padding 8px
    cursor pointer
    font-size 11px
    border-bottom 2px solid #C5C5C5
    text-align center

  .card-body
    display flex
    flex-flow row wrap
    align-items center
    justify-content flex-start

  .child-box
    $margin = 4px
    $padding = 4px
    width calc((100% / 3) - 12px)
    padding 0 $padding
    margin $margin
    border-radius 4px
    box-sizing border-box
    height 60px
    display flex
    align-items center
    justify-content center
    text-align center
    word-break break-word
    position relative
    overflow hidden

  .child-name
    cursor pointer
</style>
