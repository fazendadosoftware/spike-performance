<template>
  <div class="flex items-center justify-center mr-6">
    <div class="mr-2">Zoom</div>
    <input class="mr-2" type="range" :min="minZoom" :max="maxZoom" :step="zoomStep" v-model="localCurrentZoom" @dblclick="localCurrentZoom = 100">
    <div style="width: 20px">{{localCurrentZoom}}%</div>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
export default {
  name: 'ZoomControl',
  methods: {
    ...mapMutations({
      setCurrentZoom: 'performance/setCurrentZoom'
    })
  },
  computed: {
    ...mapGetters({
      minZoom: 'performance/minZoom',
      maxZoom: 'performance/maxZoom',
      zoomStep: 'performance/zoomStep',
      currentZoom: 'performance/currentZoom'
    }),
    localCurrentZoom: {
      get () {
        return this.currentZoom
      },
      set (val) {
        this.setCurrentZoom(val)
      }
    }
  }
}
</script>
