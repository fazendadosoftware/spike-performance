<template>
  <div v-if="!hideEmptyClusters || hideEmptyClusters && childrenCount" class="card-container">
    <div class="card-header relative" :style="headerStyle" @click="factSheetClickEvtHandler(factSheet)">
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
        :style="getChildStyle(child)"
        @click="childMouseOverEvtHandler(child)"
        @mouseover="true ? undefined : childMouseOverEvtHandler(child)"
        @mouseleave="childMouseLeaveEvtHandler(child)">
        <span class="child-name">{{child.name | truncate}}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { debounce } from '../store/modules/performance/helpers'

export default {
  name: 'FactSheetCard',
  props: {
    factSheet: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      hoveredChild: ''
    }
  },
  computed: {
    ...mapGetters({
      baseUrl: 'performance/baseUrl',
      view: 'performance/view',
      enrichedDataset: 'performance/enrichedDataset',
      childrenFilter: 'performance/childrenFilter',
      loadingIDs: 'performance/loadingIDs',
      hideEmptyClusters: 'performance/hideEmptyClusters',
      viewModel: 'performance/viewModel',
      childFactSheetNameSorting: 'performance/childFactSheetNameSorting'
    }),
    childrenCount () {
      return Object.keys(this.children).length
    },
    children () {
      const { id } = this.factSheet
      const enrichedFactSheet = this.enrichedDataset[id]
      let { children = [] } = enrichedFactSheet || {}
      children = Object.values(children
        .filter(({ id }) => this.childrenFilter.hasOwnProperty(id) && id !== this.factSheet.id)
        .reduce((accumulator, child) => {
          const { id } = child
          accumulator[id] = child
          return accumulator
        }, {}))
        .sort((A, B) => A.name > B.name ? this.childFactSheetNameSorting ? 1 : -1 : A.name < B.name ? this.childFactSheetNameSorting ? -1 : 1 : 0)
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
      const style = `background: ${bgColor} !important; color: ${color} !important; opacity: ${this.isEnriched ? 1 : 0.8}`
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
    },
    factSheetClickEvtHandler (factSheet) {
      const { id, type } = factSheet
      const link = `${this.baseUrl}/factsheet/${type}/${id}`
      this.$lx.openLink(link)
    },
    childMouseOverEvtHandler (factSheet) {
      this.hoveredChild = factSheet
    },
    childMouseLeaveEvtHandler (factSheet) {
      const { id } = factSheet
      if (this.hoveredChild && this.hoveredChild.id === id) this.hoveredChild = undefined
    }
  },
  filters: {
    truncate (value) {
      const maxLen = 32
      if (!value) return ''
      return value.length > maxLen ? `${value.substr(0, maxLen)}...` : value
    }
  },
  watch: {
    hoveredChild (factSheet) {
      this.debounceFn()
    }
  },
  created () {
    this.debounceFn = debounce(() => {
      if (this.hoveredChild) {
        const factSheet = this.hoveredChild
        this.$modal.toggle('factsheet-relationship-tree-modal', { factSheet })
      }
    }, 0)
  },
  beforeDestroy () {
    delete this.debounceFn
  }
}
</script>

<style lang="stylus" scoped>
  .card-container
    background-color #F3F3F3
    border 2px solid #C5C5C5
    border-radius 4px
    margin-right 0.75rem
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
    position relative
    overflow hidden
    transition background ease 0.3s
    background white
    word-break break-word
    text-align center

  .child-name
    cursor pointer
</style>
