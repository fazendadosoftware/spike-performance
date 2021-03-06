<template>
  <modal
    class="modal"
    name="configuration-modal"
    :adaptive="true"
    :height="'auto'"
    :resizable="true"
    @before-open="beforeOpen">
    <div class="modal-container">
      <div class="modal-header">
        <a href="javascript:;" @click="$modal.hide('configuration-modal')" class="close">x</a>
        <h3>Edit Settings</h3>
      </div>
      <div class="p-5">
        <div class="flex flex-col items-center">
          <node-select-box
            v-for="(node, idx) in localTree"
            :key="idx"
            :idx="idx"
            :node="node"
            :tree="localTree"
            @push-node="pushNode"
            @pop-node="popNode"
            @update-node="updateNode"
          />
        </div>
        <div class="mt-6">
          <label class="checkbox">
            <input type="checkbox" v-model="localFetchCompleteDatasetSetting">
            Fetch complete dataset
          </label>
        </div>
        <div class="mt-2">
          <label class="checkbox">
            <input type="checkbox" v-model="localHideEmptyClustersSetting">
            Hide empty clusters
          </label>
        </div>
      </div>
      <div class="modal-footer">
        <button
          @click="$modal.hide('configuration-modal')"
          class="w-20 bg-white hover:bg-gray-100 text-grey-600 border-solid border border-gray-400 font-bold py-2 px-4 rounded shadow focus:outline-none mr-1">
          Cancel
        </button>
        <button
          @click="applyConfiguration"
          class="w-20 btn-primary font-bold py-2 px-4 rounded shadow focus:outline-none">
          Apply
        </button>
      </div>
    </div>
  </modal>
</template>

<script>
import { mapGetters, mapMutations, mapActions } from 'vuex'
import NodeSelectBox from './NodeSelectBox'

export default {
  name: 'ConfigurationModal',
  components: { NodeSelectBox },
  data: () => ({
    localTree: [],
    localHideEmptyClustersSetting: false,
    localFetchCompleteDatasetSetting: false
  }),
  computed: {
    ...mapGetters({
      hideEmptyClusters: 'performance/hideEmptyClusters',
      fetchCompleteDataset: 'performance/fetchCompleteDataset',
      tree: 'performance/tree'
    })
  },
  methods: {
    ...mapActions({
      pushNodeToTree: 'performance/pushNodeToTree'
    }),
    ...mapMutations({
      setHideEmptyClusters: 'performance/setHideEmptyClusters',
      setFetchCompleteDataset: 'performance/setFetchCompleteDataset',
      setTree: 'performance/setTree'
    }),
    beforeOpen (evt) {
      this.localTree = [ ...this.tree ]
      this.localHideEmptyClustersSetting = this.hideEmptyClusters
      this.localFetchCompleteDatasetSetting = this.fetchCompleteDataset
    },
    pushNode (node) {
      this.pushNodeToTree({ tree: this.localTree, node })
    },
    popNode () {
      this.localTree.pop()
    },
    updateNode ({ treeIdx, node }) {
      this.localTree.splice(treeIdx, 1, node)
    },
    applyConfiguration () {
      const originalTree = this.tree.map(({ relationType }) => relationType).join('')
      const localTree = this.localTree.map(({ relationType }) => relationType).join('')
      if (localTree !== originalTree) this.setTree(this.localTree)
      if (this.localFetchCompleteDatasetSetting !== this.fetchCompleteDataset) this.setFetchCompleteDataset(this.localFetchCompleteDatasetSetting)
      if (this.localHideEmptyClustersSetting !== this.hideEmptyClusters) this.setHideEmptyClusters(this.localHideEmptyClustersSetting)
      this.$modal.hide('configuration-modal')
    }
  },
  watch: {
    tree (val) {
      this.localTree = val
    },
    hideEmptyClusters (val) {
      this.localHideEmptyClustersSetting = val
    },
    fetchCompleteDataset (val) {
      this.localFetchCompleteDatasetSetting = val
    }
  }
}
</script>

<style lang="stylus" scoped>
.v--modal-overlay[data-modal="configuration-modal"]
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
  font-size 1.0rem

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

.btn-primary
  background #1665ee
  border-color #1665ee
  color white
  &:hover
    background darken(#1665ee, 10%)
</style>
