export const queries = state => state.queries

export const reportSetup = state => state.reportSetup

export const workspaceSettings = state => state.reportSetup ? state.reportSetup.settings : undefined

export const viewModel = state => state.viewModel

export const view = state => state.view

export const factSheetTypes = state => state.factSheetTypes

export const tree = state => state.tree

export const dataset = state => state.dataset

export const enrichedDataset = state => state.enrichedDataset

export const viewPortDataset = state => state.viewPortDataset

export const treeEndpointFactSheetTypes = state => {
  const { tree } = state
  const { factSheetType } = tree[0] || {}
  const { targetFactSheetType } = tree[tree.length - 1] || {}
  return { startPointFactSheetType: factSheetType, endPointFactSheetType: targetFactSheetType }
}

export const hideEmptyClusters = state => state.hideEmptyClusters

export const loadingIDs = state => state.loadingIDs
