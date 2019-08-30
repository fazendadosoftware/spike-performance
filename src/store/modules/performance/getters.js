export const queries = state => state.queries

export const reportSetup = state => state.reportSetup

export const factSheetTypes = state => state.factSheetTypes

export const tree = state => state.tree

export const dataset = state => state.dataset

export const viewPortDataset = state => state.viewPortDataset

export const startPointFactSheetType = state => {
  const { tree } = state
  const { factSheetType } = tree[0] || {}
  return factSheetType
}

export const endPointFactSheetType = state => {
  const { tree } = state
  const { targetFactSheetType } = tree[tree.length - 1] || {}
  console.log('TARGET FACTSHEET', targetFactSheetType, tree[tree.length - 1])
  return targetFactSheetType
}
