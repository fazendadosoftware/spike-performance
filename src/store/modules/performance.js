// initial state
// shape: [{ id, quantity }]
const state = {
  tree: [],
  factSheetTypes: {},
  reportSetup: {},
  view: {},
  dataset: [],
  viewPortDataset: {}
}

// getters
const getters = {
  reportSetup: (state) => {
    return state.reportSetup
  },
  cartProducts: (state, getters, rootState) => {
    return []
    /*
    return state.items.map(({ id, quantity }) => {
      const product = rootState.products.all.find(product => product.id === id)
      return {
        title: product.title,
        price: product.price,
        quantity
      }
    })
    */
  }
}

// actions
const actions = {
  generateReportConfiguration ({ commit, state }, factSheetType) {
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
}

// mutations
const mutations = {
  setReportSetup (state, reportSetup) {
    state.reportSetup = { ...reportSetup }
  },
  setDataset (state, dataset) {
    state.dataset = dataset
  },
  setView (state, view) {
    state.view = view
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
