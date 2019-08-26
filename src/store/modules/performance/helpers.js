export const mapFactSheetTypes = state => {
  const { dataModel, translations } = state
  const { factSheets = {} } = dataModel
  const { factSheetTypes } = translations

  return Object.keys(factSheets)
    .map(factSheetType => {
      const label = factSheetTypes[`${factSheetType}.plural`]
      const relations = Object.entries(dataModel.relations)
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
          const { label } = translations.relations[relationType] || {}
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
