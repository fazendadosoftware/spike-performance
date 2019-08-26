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
