<template>
  <modal
    class="modal"
    name="configuration-modal"
    :adaptive="true"
    @before-open="beforeOpen">
    <div class="modal-container">
      <div class="modal-header">
        <a href="javascript:;" @click="$modal.hide('configuration-modal')" class="close">x</a>
        <h3>Edit Settings</h3>
      </div>
      <div class="modal-body">
        <div class="config-row">
          <div class="config-heading">
            Cluster By
          </div>
          <div class="config-line">
            <div class="config-label">Type</div>
            <div class="config-content-wrapper">
              <select class="config-content">
                <option value="BusinessCapability">Business Capabilities</option>
                <option value="UserGroup">User Groups</option>
                <option value="Process">Processes</option>
              </select>
            </div>
          </div>
          <div>
            <label class="checkbox">
              <input type="checkbox" value="on">
              Hide empty clusters
            </label>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        hello frmo footer
      </div>
    </div>
  </modal>
</template>

<script>
export default {
  name: 'ConfigurationModal',
  methods: {
    beforeOpen (evt) {
      // console.log('BEFORE OPEN', evt)
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

.close
  float right
  font-size 20px
  font-weight bold
  line-height 20px
  color #000
  text-shadow 0 1px 0 #fff
  opacity .2

.config-row
  padding 15px 0
  margin 0

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
</style>
