<template>
  <div class="border border-gray-400 rounded text-center px-2 py-1 cursor-pointer" @click="toggleChildFactSheetNameSorting">
    <font-awesome-icon :icon="childFactSheetNameSorting ? 'sort-alpha-down' : 'sort-alpha-up'"/>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
export default {
  name: 'SortControl',
  methods: {
    ...mapMutations({
      toggleChildFactSheetNameSorting: 'performance/toggleChildFactSheetNameSorting'
    })
  },
  computed: {
    ...mapGetters({
      childFactSheetNameSorting: 'performance/childFactSheetNameSorting'
    })
  }
}
</script>
