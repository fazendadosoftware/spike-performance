// import Vue from 'vue'

export const generateReportConfiguration = (store, { vm }) => {
  const { commit, state, getters } = store
  const { tree } = state
  const { treeEndpointFactSheetTypes } = getters
  const { startPointFactSheetType, endPointFactSheetType } = treeEndpointFactSheetTypes

  if (!tree.length) throw Error('tree is empty')

  return {
    allowEditing: false,
    allowTableView: false,
    menuActions: {
      showConfigure: true,
      configureCallback: () => vm.$modal.toggle('configuration-modal')
    },
    facets: [
      {
        key: startPointFactSheetType,
        fixedFactSheetType: startPointFactSheetType,
        attributes: ['name'],
        callback: dataset => commit('setDataset', dataset)
      },
      {
        key: endPointFactSheetType,
        fixedFactSheetType: endPointFactSheetType,
        facetFiltersChangedCallback: filter => commit('setChildrenFilter', filter)
      }
    ],
    reportViewCallback: view => commit('setView', view),
    reportViewFactSheetType: endPointFactSheetType
  }
}

export const updateNode = async ({ commit }, { treeIdx, node }) => {
  commit('updateNode', { treeIdx, node })
}

export const factSheetVisibilityEvtHandler = ({ commit, state }, { isVisible, entry, factSheet }) => {
  const { viewPortDataset } = state
  const { name, id } = factSheet
  if (isVisible) commit('setViewPortDatasetFactSheet', { name, id })
  else if (viewPortDataset[name]) commit('deleteViewPortDatasetFactSheet', { name })
}

export const fetchViewPortDataset = async ({ commit, state, dispatch }) => {
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
      type
      ...on ${factSheetType} {
        id
        name
        ${relationType} {
          totalCount
          edges {
            node {
              factSheet {
                type
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
  // console.log('QUERY', query)
  /*
  const datasetKeys = Object.keys(viewPortDataset)
    .sort()
  const start = Date.now()
  Vue.notify({
    group: 'custom-report',
    // type: 'warn',
    title: `Query start, ${tree.length} hop${tree.length === 1 ? '' : 's'}`,
    text: `${datasetKeys[0]} / ${datasetKeys[datasetKeys.length - 1]}`
  })
  */
  commit('queryStart')
  commit('setLoadingIDs', ids)

  // eslint-disable-next-line
  const getNodeDependencyTree = (edge, tree, parentNodeTree = []) => {
    const { node } = edge
    const { factSheet } = node
    if (parentNodeTree.length === tree.length) {
      return { ...factSheet, parentNodeTree }
    } else {
      const dependencyNode = tree[parentNodeTree.length]
      const { relationType } = dependencyNode
      const { edges } = { ...(factSheet || node)[relationType] }
      factSheet ? delete factSheet[relationType] : delete node[relationType]
      parentNodeTree.unshift(factSheet || node)
      return edges.map(edge => getNodeDependencyTree(edge, tree, [...parentNodeTree]))
    }
  }

  try {
    const enrichedDataset = await lx.executeGraphQL(query, { filter: { ids } })
      .then(res => {
        const dataset = res.allFactSheets.edges
          .map(edge => {
            const children = getNodeDependencyTree(edge, tree)
              .reduce((accumulator, children) => {
                if (Array.isArray(children)) {
                  children.reduce((accumulator, child) => {
                    const { id } = child
                    accumulator[id] = child
                  }, accumulator)
                } else {
                  const { id } = children
                  accumulator[id] = children
                }
                return accumulator
              }, {})
            const { node } = edge
            return { ...node, children }
          })
          // .reduce((accumulator, node) => { return { ...accumulator, [node.id]: node } }, {})
        return dataset
      })
    /*
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
    */

    // Get the view mapping for all children factsheets (endPointFactSheets) currently in the viewport
    const childrenFsIds = Object.keys(Object.values(enrichedDataset)
      .map(({ children = {} }) => children)
      .reduce((accumulator, children) => { return { ...accumulator, ...children } }, {}))
    let { mapping = [] } = await dispatch('getViewForEndpointFactSheets', childrenFsIds)
    mapping = mapping.reduce((accumulator, { fsId, legendId }) => {
      accumulator[fsId] = legendId
      return accumulator
    }, {})

    // enrich the dataset with the view mapping, legendItem attribute
    enrichedDataset.forEach(fs => {
      const { children } = fs
      Object.values(children).forEach(child => {
        const { id } = child
        child.legendItem = mapping[id] || -1
      })
    })

    commit('setEnrichedDataset', enrichedDataset)
    commit('setLoadingIDs', [])
    commit('queryEnd')
  } catch (err) {
    commit('setLoadingIDs', [])
    commit('queryEnd')
    throw err
  }
}

export const getViewForEndpointFactSheets = async ({ getters }, childrenFsIds = []) => {
  const { treeEndpointFactSheetTypes = {}, view = {} } = getters
  const { endPointFactSheetType = '' } = treeEndpointFactSheetTypes
  const { key } = view
  const query = `
    query($factSheetType:FactSheetType,$key:String,$filter:FilterInput,$viewOption:ViewOptionInput){
      view(factSheetType:$factSheetType,key:$key,filter:$filter,viewOption:$viewOption){
        viewInfos{key label type viewOptionSupport{optionalConstraint usesRangeLegend}}
        legendItems{id bgColor color value inLegend transparency}
        mapping{fsId legendId constraints{key value} infos}
      }
    }
  `
  const variables = {
    factSheetType: endPointFactSheetType,
    key,
    filter: {
      ids: childrenFsIds
    }
  }
  const mapping = await lx.executeGraphQL(query, variables)
    .then(({ view = {} }) => view)
  return mapping
}
