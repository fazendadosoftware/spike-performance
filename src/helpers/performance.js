import EventEmitter from 'events'
import { debounce } from './index'
import Vue from 'vue'

export default class Performance extends EventEmitter {
  constructor () {
    super()
    /* global lx */
    if (!lx) throw Error('lx not found')
    this._tree = []
    this._factSheetTypes = {}
    this._reportSetup = {}
    this._view = {}
    this._dataset = []
    this._viewPortDataset = {}
    this.debounceFn = debounce(() => {
      this.fetchViewPortDataset()
      this.emit('fetching-data', this.viewPortDataset)
    }, 500)
  }

  get reportSetup () {
    return this._reportSetup
  }

  get tree () {
    return this._tree
  }

  get factSheetTypes () {
    return this._factSheetTypes
  }

  get dataModel () {
    return this._dataModel
  }

  get translations () {
    return this._translations
  }

  /**
   * Setter for report setup
   * @param {ReportSetup} the report setup object
   * @returns {undefined}
   */
  set reportSetup (reportSetup) {
    this._reportSetup = reportSetup
    const { settings } = reportSetup
    const { dataModel, translations } = settings
    this._translations = translations
    this._dataModel = dataModel

    this._factSheetTypes = this.mapFactSheetTypes()
    this.emit('factSheetTypes', this._factSheetTypes)

    const defaultFactSheetType = Object.values(this._factSheetTypes)
      .sort((typeA, typeB) => {
        const factSheetTypeALabel = typeA.label
        const factSheetTypeBLabel = typeB.label
        return factSheetTypeALabel > factSheetTypeBLabel ? 1 : factSheetTypeALabel < factSheetTypeBLabel ? -1 : 0
      })
      .shift()

    const { factSheetType, relations } = defaultFactSheetType

    const node = { factSheetType, relationType: relations.length ? relations[0].relationType : '' }

    this.addNodeToTree(node)
  }

  /**
   * Setter for the report view
   * @param {any} view
   */
  set view (view) {
    this._view = view
  }

  get dataset () {
    return this._dataset
  }

  set dataset (dataset) {
    this._dataset = dataset
    this.emit('dataset', dataset)
  }

  set viewPortDataset (viewPortDataset) {
    this._viewPortDataset = viewPortDataset
    this.debounceFn()
  }

  get viewPortDataset () {
    return this._viewPortDataset
  }

  /**
   * Generate the report configuration
   * @return {ReportConfiguration} the report configuration requested by the client to the framework via lx.ready() method.
   */
  generateReportConfiguration (factSheetType) {
    if (!this.tree.length) throw Error('tree is empty')
    const defaultFactSheetType = factSheetType || this.tree[0].factSheetType
    return {
      allowEditing: false,
      allowTableView: false,
      facets: [
        {
          key: defaultFactSheetType,
          fixedFactSheetType: defaultFactSheetType,
          attributes: ['name'],
          callback: dataset => { this.dataset = dataset }
        }
      ],
      reportViewCallback: view => {
        this.view = view
      },
      reportViewFactSheetType: defaultFactSheetType
    }
  }

  mapFactSheetTypes () {
    const { factSheets = {} } = this.dataModel
    const { factSheetTypes } = this.translations

    return Object.keys(factSheets)
      .map(factSheetType => {
        const label = factSheetTypes[`${factSheetType}.plural`]
        const relations = Object.entries(this.dataModel.relations)
          .map(([key, relation]) => { return { ...relation, key } })
          // Filter all relations which have as source the factSheetType we are pushing
          .filter(({ from, to }) => from.factSheetType === factSheetType || to.factSheetType === factSheetType)
          .map(relation => {
            const { from, to } = relation
            const relationType = to.factSheetType === factSheetType
              ? to.name
              : from.name
            const targetFactSheetType = to.factSheetType === factSheetType
              ? from.factSheetType
              : to.factSheetType
            const { label } = this.translations.relations[relationType] || {}
            return { relationType, label, targetFactSheetType }
          })
          // Sort relations alphabetically by target FactSheetType
          .sort((a, b) => {
            const labelA = a.label
            const labelB = b.label
            return (labelA < labelB) ? -1 : (labelA > labelB) ? 1 : 0
          })
        return { factSheetType, label, relations }
      })
      .reduce((accumulator, t) => {
        const { factSheetType } = t
        return { ...accumulator, [factSheetType]: t }
      }, {})
  }

  updateNode (treeIdx, node) {
    if (treeIdx === 0) {
      const firstNode = this.tree[0]
      const { factSheetType } = node
      if (firstNode.factSheetType !== factSheetType) {
        const config = this.generateReportConfiguration(factSheetType)
        lx.updateConfiguration(config)
      }
    }
    this.tree.splice(treeIdx, 1, node)
    this.emit('tree', this._tree)
    return this._tree
  }

  pushNode () {
    const lastNode = this.tree[this.tree.length - 1]
    let { factSheetType, relationType } = lastNode
    const relation = this.factSheetTypes[factSheetType].relations
      .find(relation => relation.relationType === relationType)
    let { targetFactSheetType } = relation
    targetFactSheetType = this.factSheetTypes[targetFactSheetType]
    const { relations } = targetFactSheetType
    const factSheetTypesInTree = this.tree.map(node => node.factSheetType)
    const filteredRelations = relations.filter(({ targetFactSheetType }) => factSheetTypesInTree.indexOf(targetFactSheetType) < 0)
    const targetRelationType = filteredRelations.length ? filteredRelations[0].relationType : ''
    const node = { factSheetType: targetFactSheetType.factSheetType, relationType: targetRelationType }
    this._tree.push(node)
    this.emit('tree', this._tree)
    return this._tree
  }

  popNode () {
    this._tree.pop()
    this.emit('tree', this._tree)
    return this._tree
  }

  addNodeToTree (node) {
    delete node.relations
    this._tree.push(node)
    this.emit('tree', this._tree)
  }

  async fetchViewPortDataset () {
    const ids = Object.values(this.viewPortDataset)
      .map(item => item.id)

    const FRAGMENT_TOKEN = `%%NEXT_FRAGMENT%%`
    const replaceFragmentTokenRegex = new RegExp(FRAGMENT_TOKEN, 'g')
    const query = this.tree.reduce((accumulator, edge, idx, tree) => {
      const isLastNode = idx === (tree.length - 1)
      const { factSheetType, relationType } = edge
      const { targetFactSheetType } = this.factSheetTypes[factSheetType].relations
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
    }`)
    console.log('QUERY', query)
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
}
