<template>
  <div>
    <div class="flex items-center mb-2">
      <div class="block relative w-64">
        <select
          v-model="factSheetType"
          :disabled="tree.length > 1"
          class="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
          :class="editable ? 'cursor-pointer' : 'cursor-default'"
          >
          <option
            v-for="(option, idx) in factSheetTypeOptions"
            :key="idx"
            :value="option.factSheetType || option.targetFactSheetType"
            >
            {{option.label}}
          </option>
        </select>
        <div v-if="(tree.length < 1)" class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
        </div>
      </div>
    </div>
    <div class="flex items-center" v-if="isLastInTree">
      <div class="block relative w-64">
        <select
          v-model="relation"
          :disabled="!editable"
          class="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
          :class="editable ? 'cursor-pointer' : 'cursor-default'"
          >
          <option
            v-for="(relation, idx) in relations"
            :key="idx"
            :value="relation.relationType"
            >
            {{relation.label}}
          </option>
        </select>
        <div v-if="editable" class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
        </div>
      </div>
      <div class="flex ml-2 w-24" v-if="isLastInTree">
        <button
          v-if="!isFirstInTree"
          @click="$emit('remove-node')"
          class="outline-none shadow-md cursor-pointer bg-red-500 hover:bg-red-700 border border-red-700 text-white font-semi-bold rounded m-1 p-1 w-12">
          <font-awesome-icon icon="minus" />
        </button>
        <button
          v-if="!isStub"
          @click="$emit('add-node')"
          class="outline-none shadow-md cursor-pointer bg-green-500 hover:bg-green-700 border border-green-700 text-white font-semi-bold rounded m-1 p-1 w-12">
          <font-awesome-icon icon="plus" />
        </button>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'FactSheetSelectBox',
  props: {
    tree: {
      type: Array,
      required: true
    },
    node: {
      type: Object,
      required: true
    },
    factSheetTypes: {
      type: Object,
      required: true
    },
    idx: {
      type: Number,
      required: true
    }
  },
  computed: {
    factSheetType: {
      get () {
        const { factSheetType } = this.node
        return factSheetType
      },
      set (factSheetType) {
        const { relations = [] } = this.factSheetTypes[factSheetType]
        const { relationType } = relations
          .sort((a, b) => {
            const labelA = a.label
            const labelB = b.label
            return labelA > labelB ? 1 : labelA < labelB ? -1 : 0
          })[0]
        this.$emit('node-update', this.idx, { factSheetType, relationType })
      }
    },
    relation: {
      get () {
        const { relationType } = this.node
        return relationType
      },
      set (relationType) {
        const { factSheetType } = this
        this.$emit('node-update', this.idx, { factSheetType, relationType })
      }
    },
    relations () {
      const usedFactSheetTypesInTree = this.tree.map(node => node.factSheetType)
      const { relations = [] } = this.factSheetTypes[this.factSheetType]
      const filteredRelations = relations.filter(({ targetFactSheetType }) => usedFactSheetTypesInTree.indexOf(targetFactSheetType) < 0)
      return filteredRelations
    },
    editable () {
      return this.tree.length === 2 || (this.idx >= (this.tree.length - 2))
    },
    factSheetTypeOptions () {
      let options = []
      if (this.isFirstInTree) {
        options = Object.values(this.factSheetTypes)
          .sort((a, b) => {
            const labelA = a.label
            const labelB = b.label
            return labelA > labelB ? 1 : labelA < labelB ? -1 : 0
          })
      } else {
        const parentFactSheetType = this.factSheetTypes[this.tree[this.idx - 1].factSheetType]
        const { relations } = parentFactSheetType
        options = relations
      }
      return options
    },
    isFirstInTree () {
      return this.idx === 0
    },
    isLastInTree () {
      return this.idx === (this.tree.length - 1)
    },
    isStub () {
      const factSheetType = this.factSheetTypes[this.factSheetType]
      const { relationType } = this.node
      const { relations } = factSheetType
      const relation = relations.find((relation) => relation.relationType === relationType)
      const targetFactSheetType = this.factSheetTypes[relation.targetFactSheetType]
      const targetFactSheetTypeRelations = targetFactSheetType.relations
      const usedFactSheetTypesInTree = this.tree.map(node => node.factSheetType)
      const availableRelations = targetFactSheetTypeRelations.filter(({ targetFactSheetType }) => usedFactSheetTypesInTree.indexOf(targetFactSheetType) < 0).length
      return !availableRelations && this.isLastInTree
    }
  }
}
</script>
