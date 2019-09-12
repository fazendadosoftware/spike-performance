export default {
  isIE: navigator && navigator.userAgent ? navigator.userAgent.indexOf('Trident') > -1 : false,
  queries: 0,
  tree: [],
  factSheetTypes: {},
  reportSetup: {},
  baseUrl: '',
  translations: {},
  dataModel: {},
  viewModel: {},
  view: { mapping: [] },
  dataset: [],
  enrichedDataset: {},
  viewPortDataset: {},
  childrenFilter: {},
  hideEmptyClusters: false,
  fetchCompleteDataset: true,
  loadingIDs: [],
  minZoom: 10,
  maxZoom: 200,
  zoomStep: 5,
  currentZoom: 100,
  childFactSheetNameSorting: true
}
