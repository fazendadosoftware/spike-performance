<template>
  <div class="bg-green-200 p-1 my-3 mx-1">
    {{node.label}}
  </div>
</template>
<script>
export default {
  name: 'FactsheetNode',
  props: {
    node: {
      type: Object,
      required: true
    }
  }
}
</script>
