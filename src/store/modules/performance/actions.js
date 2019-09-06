export const generateReportConfiguration = (store, { vm }) => { /* eslint-disable */
  const { commit, state, getters, dispatch } = store
  const { tree } = state
  const { treeEndpointFactSheetTypes } = getters
  const { startPointFactSheetType, endPointFactSheetType } = treeEndpointFactSheetTypes

  if (!tree.length) throw Error('tree is empty')

  const reportConfiguration = {
    allowEditing: false,
    allowTableView: false,
    menuActions: {
      showConfigure: true,
      configureCallback: () => {
        vm.$modal.hide('factsheet-dependency-tree-modal')
        vm.$modal.toggle('configuration-modal')
      }
    },
    facets: [
      {
        key: startPointFactSheetType,
        fixedFactSheetType: startPointFactSheetType,
        attributes: ['name'],
        callback: dataset => commit('setDataset', dataset)
      },
      {
        key: `children-${endPointFactSheetType}`,
        fixedFactSheetType: endPointFactSheetType || '',
        attributes: ['name'],
        callback: dataset => commit('setChildrenFilter', dataset)
      }
    ],
    reportViewFactSheetType: endPointFactSheetType || null,
    reportViewCallback: !!endPointFactSheetType
      ? view => {
        commit('setView', view)
        dispatch('updateViewForEndpointFactSheets')
      } : undefined
  }
  return reportConfiguration
}

export const updateNode = async ({ commit }, { treeIdx, node }) => {
  commit('updateNode', { treeIdx, node })
}

export const factSheetVisibilityEvtHandler = async ({ commit, state }, { isVisible, entry, factSheet }) => {
  const { viewPortDataset } = state
  const { name, id } = factSheet
  const currentState = viewPortDataset[id]
  if (isVisible) {
    if (!currentState || currentState.name !== name) {
      await commit('setViewPortDatasetFactSheet', { name, id })
    }
  } else if (viewPortDataset[id]) await commit('deleteViewPortDatasetFactSheet', { id })
}

export const fetchViewPortDataset = async ({ commit, state, dispatch }) => {
  const { dataset, viewPortDataset, tree, fetchCompleteDataset } = state
  const ids = fetchCompleteDataset ? dataset.map(({ id }) => id) : Object.keys(viewPortDataset)

  const FRAGMENT_TOKEN = `%%NEXT_FRAGMENT%%`
  const replaceFragmentTokenRegex = new RegExp(FRAGMENT_TOKEN, 'g')
  const query = tree.reduce((accumulator, edge, idx, tree) => {
    const isLastNode = idx === (tree.length - 1)
    const { factSheetType, relationType } = edge
    const fragment = `
      type
      id
      name
      ...on ${factSheetType} {
        ${relationType} {
          totalCount
          edges {
            node {
              factSheet {
                type
                id
                name
                ${isLastNode ? `` : FRAGMENT_TOKEN}
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
  commit('queryStart')
  commit('setLoadingIDs', ids)

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
      return edges
        .map(edge => getNodeDependencyTree(edge, tree, [...parentNodeTree]))
        .reduce((accumulator, mappedChildren) => {
          if (Array.isArray(mappedChildren)) accumulator = [...accumulator, ...mappedChildren]
          else accumulator.push(mappedChildren)
          return accumulator
        }, [])
    }
  }

  try {
    const variables = { filter: { ids } }
    const enrichedDataset = await lx.executeGraphQL(query, variables)
      .then(res => {
        const dataset = res.allFactSheets.edges
          .map(edge => {
            const children = getNodeDependencyTree(edge, tree)
            const { node } = edge
            return { ...node, children }
          })
        return dataset
      })
    commit('setEnrichedDataset', enrichedDataset)
    commit('setLoadingIDs', [])
    commit('queryEnd')
    dispatch('updateViewForEndpointFactSheets')
  } catch (err) {
    commit('setLoadingIDs', [])
    commit('queryEnd')
    throw err
  }
}

export const updateViewForEndpointFactSheets = async ({ getters, commit }) => {
  const { treeEndpointFactSheetTypes = {}, view = {}, enrichedDataset } = getters
  const { endPointFactSheetType = '' } = treeEndpointFactSheetTypes
  const { key } = view

  const childrenFsIds = Object.keys(Object.values(enrichedDataset)
    .map(({ children = {} }) => children)
    .reduce((accumulator, children) => {
      children.forEach(child => {
        const { id } = child
        accumulator[id] = child
      })
      return accumulator
    }, {}))

  if (!childrenFsIds.length) return

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
  commit('queryStart')
  try {
    let legendItems = []
    const mapping = await lx.executeGraphQL(query, variables)
      .then(({ view = {} }) => {
        const { mapping = [] } = view
        legendItems = view.legendItems
        return (mapping || []).reduce((accumulator, { fsId, legendId }) => {
          accumulator[fsId] = legendId
          return accumulator
        }, {})
      })
    const enrichedDatasetClone = Object.values(enrichedDataset)
      .reduce((accumulator, fs) => {
        let { id, children } = fs
        children = Object.values(children).map(child => {
          const { id } = child
          const legendItem = mapping[id]
          const view = legendItems.length > legendItem + 1 ? legendItems[legendItem + 1] : {}
          return { ...child, legendItem, view }
        })
        accumulator[id] = { ...fs, children }
        return accumulator
      }, {})
    commit('queryEnd')
    commit('setEnrichedDataset', enrichedDatasetClone)
    return mapping
  } catch (err) {
    commit('queryEnd')
    throw err
  }
}

// pushes node to local tree, doesn't commit any changes to the state
export const pushNodeToTree = ({ state }, { tree, node }) => {
  const { factSheetTypes } = state
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
  return tree
}

