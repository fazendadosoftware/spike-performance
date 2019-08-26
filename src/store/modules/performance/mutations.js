import { mapFactSheetTypes } from './helpers'

export const setReportSetup = (state, reportSetup) => {
  const { settings } = reportSetup
  const { dataModel, translations } = settings
  state.reportSetup = { ...reportSetup }
  state.translations = translations
  state.dataModel = dataModel

  const factSheetTypes = mapFactSheetTypes(state)
  state.factSheetTypes = factSheetTypes

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

  // add node to tree
  const node = { factSheetType, relationType: relations.length ? relations[0].relationType : '' }
  state.tree.push(node)
}

export const setDataset = (state, dataset) => {
  state.dataset = dataset
}

export const setView = (state, view) => {
  state.view = view
}

export const addNodeToTree = (state, node) => {
  delete node.relations
  state.tree.push(node)
}
