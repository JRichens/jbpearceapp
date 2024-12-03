export const capitalizeWords = (str: string): string => {
    return str.toUpperCase()
}

export const formatNomCC = (value: string): string => {
    return value.replace(/(\d+)cc/i, '$1CC')
}

export const PLACEMENT_OPTIONS = ['Front', 'Back', 'Left', 'Right']
export const DEFAULT_TITLE_PARAMS = ['dvlaMake', 'dvlaModel', 'modelSeries']

export const generateTitle = (
    vehicle: any,
    selectedParams: Set<string>,
    partDescription: string,
    productionYearInfo: any,
    placement: string
): string => {
    if (!vehicle || !partDescription) return ''

    const titleParts: string[] = []

    // Add vehicle details
    if (selectedParams.has('dvlaMake')) titleParts.push(vehicle.dvlaMake)
    if (selectedParams.has('dvlaModel')) titleParts.push(vehicle.dvlaModel)
    if (selectedParams.has('modelSeries') && vehicle.modelSeries)
        titleParts.push(vehicle.modelSeries)
    if (selectedParams.has('nomCC') && vehicle.nomCC)
        titleParts.push(formatNomCC(vehicle.nomCC))

    // Add production years if available
    if (productionYearInfo) {
        if (selectedParams.has('productionYears')) {
            titleParts.push(
                `${productionYearInfo.from} ${productionYearInfo.to}`
            )
        } else if (
            selectedParams.has('productionYearsFL') &&
            productionYearInfo.facelift
        ) {
            titleParts.push(
                `${productionYearInfo.from} ${productionYearInfo.facelift}`
            )
        }
    }

    // Add placement if specified
    if (placement) titleParts.push(placement)

    // Add color if selected
    if (selectedParams.has('colourCurrent') && vehicle.colourCurrent) {
        titleParts.push(vehicle.colourCurrent)
    }

    // Add part description
    titleParts.push(partDescription)

    return titleParts.join(' ')
}
