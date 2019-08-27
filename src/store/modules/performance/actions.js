import Vue from 'vue'
export const generateReportConfiguration = (store, { factSheetType, vm }) => {
  const { commit, state } = store
  const { tree } = state
  console.log('STORE', store, vm)
  if (!tree.length) throw Error('tree is empty')
  const defaultFactSheetType = factSheetType || tree[0].factSheetType
  return {
    allowEditing: false,
    allowTableView: false,
    menuActions: {
      showConfigure: true,
      configureCallback: () => {
        vm.$modal.toggle('configuration-modal')
        // vm.$modal.show('configuration-modal', { foo: 'bar' })
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

export const factSheetVisibilityEvtHandler = ({ commit, state }, { isVisible, entry, factSheet }) => {
  const { viewPortDataset } = state
  const { name, id } = factSheet
  if (isVisible) commit('setViewPortDatasetFactSheet', { name, id })
  else if (viewPortDataset[name]) commit('deleteViewPortDatasetFactSheet', { name })
}

export const fetchViewPortDataset = async ({ commit, state }) => {
  const { viewPortDataset, tree, factSheetTypes } = state
  const ids = Object.values(viewPortDataset).map(item => item.id)

  const FRAGMENT_TOKEN = `%%NEXT_FRAGMENT%%`
  const replaceFragmentTokenRegex = new RegExp(FRAGMENT_TOKEN, 'g')
  const query = tree.reduce((accumulator, edge, idx, tree) => {
    const isLastNode = idx === (tree.length - 1)
    const { factSheetType, relationType } = edge
    const { targetFactSheetType } = factSheetTypes[factSheetType].relations
      .find(relation => relation.relationType === relationType)
    const fragment = `
      ...on ${factSheetType} {
        id
        name
        ${relationType} {
          totalCount
          edges {
            node {
              factSheet {
                ${isLastNode ? `...on ${targetFactSheetType} { id name }` : FRAGMENT_TOKEN}
              }
            }
          }
        }
      }`
    return accumulator.replace(replaceFragmentTokenRegex, fragment)
  }, `query($filter:FilterInput){
    allFactSheets(filter:$filter) {
      edges {
        node {
          ${FRAGMENT_TOKEN}
        }
      }
    }
  }`).replace(/\s\s+/g, ' ')
  console.log('QUERY', query)
  const datasetKeys = Object.keys(viewPortDataset)
    .sort()
  Vue.notify({
    group: 'custom-report',
    // type: 'warn',
    title: `Query start, ${tree.length} hop${tree.length === 1 ? '' : 's'}`,
    text: `${datasetKeys[0]} / ${datasetKeys[datasetKeys.length - 1]}`
  })
  commit('queryStart')
  const start = Date.now()
  const dataset = await lx.executeGraphQL(query, { filter: { ids } })
    .then(res => {
      const dataset = res.allFactSheets.edges
        .map(edge => {
          const { node } = edge
          return node
        })
        .reduce((accumulator, node) => { return { ...accumulator, [node.id]: node } }, {})
      return dataset
    })
  commit('queryEnd')
  const delay = Date.now() - start
  Vue.notify({
    group: 'custom-report',
    title: 'Reponse time',
    type: delay <= 400
      ? 'success'
      : delay <= 1000
        ? 'warn'
        : 'error',
    text: `${delay}ms`
  })
  console.log('RX_DATASET', dataset)
}
