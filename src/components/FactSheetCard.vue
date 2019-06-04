<template>
  <div class="bg-green-100 p-2 m-2 bg-white border-solid border border-gray-300 shadow-md w-64 h-64">
    {{factSheet.name}}
  </div>
</template>

<script>
export default {
  props: {
    factSheet: {
      type: Object,
      required: true
    }
  }
}
</script>
