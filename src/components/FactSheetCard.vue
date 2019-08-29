<template>
  <div class="card-container">
    <div class="card-header">
      {{factSheet.name}}
    </div>
    <div class="card-body">
      <div v-for="child in children" :key="child.id" class="child-box">
        <span class="child-name">{{child.name}}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FactSheetCard',
  props: {
    factSheet: {
      type: Object,
      required: true
    }
  },
  data: () => ({
    children: [
      { id: 1, name: 'Application 1' },
      { id: 2, name: 'Application 2' },
      { id: 3, name: 'Application 3' },
      { id: 4, name: 'Application 4' },
      { id: 5, name: 'Application 5' },
      { id: 6, name: 'Application 6' }
    ]
  })
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
    justify-content center

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
