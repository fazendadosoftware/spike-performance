<template>
  <div
    @click="!!queries ? undefined : fetchViewPortDataset()"
    :class="!!queries ? 'opacity-50' : 'cursor-pointer'"
    class="border border-gray-400 rounded text-center px-2 py-1">
    <font-awesome-icon icon="sync" :spin="!!queries"/>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
export default {
  name: 'RefreshControl',
  methods: {
    ...mapActions({
      fetchViewPortDataset: 'performance/fetchViewPortDataset'
    })
  },
  computed: {
    ...mapGetters({
      queries: 'performance/queries'
    })
  }
}
</script>
