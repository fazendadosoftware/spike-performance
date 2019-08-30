export const queries = state => state.queries

export const reportSetup = state => state.reportSetup

export const factSheetTypes = state => state.factSheetTypes

export const tree = state => state.tree

export const dataset = state => state.dataset

export const viewPortDataset = state => state.viewPortDataset

export const treeEndpointFactSheetTypes = state => {
  const { tree } = state
  const { factSheetType } = tree[0] || {}
  const { targetFactSheetType } = tree[tree.length - 1] || {}
  return { startPointFactSheetType: factSheetType, endPointFactSheetType: targetFactSheetType }
}
