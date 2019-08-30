import Vue from 'vue'
import { mapFactSheetTypes } from './helpers'

export const queryStart = state => state.queries++

export const queryEnd = state => state.queries--

export const setReportSetup = (state, reportSetup) => {
  const { settings } = reportSetup
  const { dataModel, translations } = settings
  state.reportSetup = { ...reportSetup }
  state.translations = translations
  state.dataModel = dataModel

  const factSheetTypes = mapFactSheetTypes(state)
  state.factSheetTypes = factSheetTypes

  // Initialize tree
  pushNodeToTree(state)
}

export const setDataset = (state, dataset) => {
  state.viewPortDataset = {}
  state.enrichedDataset = {}
  state.dataset = dataset
}

export const setEnrichedDataset = (state, datasetFragment) => {
  const { enrichedDataset } = state
  Object.values(datasetFragment)
    .forEach(factSheet => {
      const { id } = factSheet
      Vue.set(enrichedDataset, id, factSheet)
    })
}

export const setViewPortDatasetFactSheet = (state, { name, id }) => {
  const { viewPortDataset } = state
  Vue.set(viewPortDataset, name, { id })
}

export const deleteViewPortDatasetFactSheet = (state, { name }) => {
  const { viewPortDataset } = state
  if (viewPortDataset[name]) delete viewPortDataset[name]
}

export const setView = (state, view) => {
  state.view = view
}

export const setChildrenFilter = (state, filter) => {
  state.childrenFilter = filter
}

// appends a node to the tree
export const pushNodeToTree = (state, node) => {
  const { tree, factSheetTypes } = state
  if (!node) {
    if (!tree.length) {
      const defaultFactSheetType = Object.values(factSheetTypes)
        .sort((typeA, typeB) => {
          const factSheetTypeALabel = typeA.label
          const factSheetTypeBLabel = typeB.label
          return factSheetTypeALabel > factSheetTypeBLabel
            ? 1
            : factSheetTypeALabel < factSheetTypeBLabel
              ? -1
              : 0
        })
        .shift()
      const { factSheetType, relations } = defaultFactSheetType
      const { relationType, targetFactSheetType } = relations.length ? relations[0] : {}
      node = { factSheetType, relationType, targetFactSheetType }
    } else {
      const lastNode = tree[tree.length - 1]
      let { factSheetType, relationType } = lastNode
      const relation = factSheetTypes[factSheetType].relations
        .find(relation => relation.relationType === relationType)
      let { targetFactSheetType } = relation
      targetFactSheetType = factSheetTypes[targetFactSheetType]
      const { relations } = targetFactSheetType
      const factSheetTypesInTree = tree.map(node => node.factSheetType)
      const filteredRelations = relations.filter(({ targetFactSheetType }) => factSheetTypesInTree.indexOf(targetFactSheetType) < 0)
      const targetRelation = filteredRelations.length ? filteredRelations[0] : {}
      node = {
        factSheetType: targetFactSheetType.factSheetType,
        relationType: targetRelation.relationType,
        targetFactSheetType: targetRelation.targetFactSheetType
      }
    }
  }
  tree.push(node)
}

// removes the last node from tree
export const popNodeFromTree = state => {
  const { tree } = state
  tree.pop()
}

export const updateNode = (state, { treeIdx, node }) => {
  const { tree } = state
  tree.splice(treeIdx, 1, node)
}
