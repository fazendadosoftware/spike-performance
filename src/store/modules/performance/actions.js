export const generateReportConfiguration = (
  { commit, state },
  factSheetType
) => {
  const { tree } = state
  if (!tree.length) throw Error('tree is empty')
  const defaultFactSheetType = factSheetType || tree[0].factSheetType
  return {
    allowEditing: false,
    allowTableView: false,
    menuActions: {
      showConfigure: true,
      configureCallback: () => {
        console.log('SHOWING CONFIGURE CALLBACK')
      }
    },
    facets: [
      {
        key: defaultFactSheetType,
        fixedFactSheetType: defaultFactSheetType,
        attributes: ['name'],
        callback: dataset => commit('setDataset', dataset)
      }
    ],
    reportViewCallback: view => commit('setView', view),
    reportViewFactSheetType: defaultFactSheetType
  }
}

export const updateNode = async ({ commit, dispatch, state }, { treeIdx, node }) => {
  const { tree } = state
  if (treeIdx === 0) {
    const firstNode = tree[0]
    const { factSheetType } = node
    if (firstNode.factSheetType !== factSheetType) {
      const config = await dispatch('generateReportConfiguration', factSheetType)
      console.log('GOT CONFIG', config)
      // lx.updateConfiguration(config)
    }
  }
  commit('updateNode', { treeIdx, node })
}
