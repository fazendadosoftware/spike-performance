<template>
  <div class="card-container">
    <div class="card-header">
      {{factSheet.name}} {{hasChildren}} {{childrenCount}}
    </div>
    <div class="card-body">
      <div v-for="child in children" :key="child.id" class="child-box">
        <span class="child-name">{{child.name}}</span>
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
      enrichedDataset: 'performance/enrichedDataset'
    }),
    hasChildren () {
      const { id } = this.factSheet
      return !!this.enrichedDataset[id]
    },
    childrenCount () {
      return Object.keys(this.children).length
    },
    children () {
      const { id } = this.factSheet
      const enrichedFactSheet = this.enrichedDataset[id]
      const { children = [] } = enrichedFactSheet || {}
      return Object.values(children)
    }
  },
  watch: {
    children (val) {
      if (val.length) console.log('CHILDREN', val)
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
    background-color #354567
    text-align center
    cursor pointer
    font-size 11px
    color white
    border-bottom 2px solid #C5C5C5

  .card-body
    display flex
    flex-flow row wrap
    align-items center
    justify-content flex-start

  .child-box
    $margin = 4px
    $padding = 4px
    width calc((100% / 3) - 12px)
    padding $padding
    margin $margin
    border-radius 4px
    box-sizing border-box
    height 60px
    display flex
    align-items center
    justify-content center
    border 2px solid red

  .child-name
    cursor pointer
</style>
